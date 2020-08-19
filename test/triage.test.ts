import { promises as fs } from "fs"
import path from "path"
import nock from "nock"
import { Probot } from "probot"
import payload from "./fixtures/issues.opened.json"
import app from "../src"

const baseUrl = "https://api.github.com"
const owner = "chakra-ui"
const repo = "chakra-bot"

const labelAddedBody = ["needs triage"]
const labelCreatedBody = { name: "needs triage", color: "ffffff" }

describe("triage", () => {
  let probot: any
  let mockCert: string

  beforeAll(async () => {
    try {
      const cert = await fs.readFile(
        path.join(__dirname, "fixtures/mock-cert.pem"),
        "utf-8",
      )
      mockCert = cert
    } catch (e) {
      return
    }
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert })
    // Load our app into probot
    probot.load(app)

    // return a test token
    nock(baseUrl)
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })
  })

  test('adds the "needs triage" label when an issue is opened', async (done) => {
    // return existing label
    nock(baseUrl)
      .get(`/repos/${owner}/${repo}/labels/needs%20triage`)
      .reply(200)

    // test that the label is applied
    nock(baseUrl)
      .post(`/repos/${owner}/${repo}/issues/1/labels`, (body) => {
        done(expect(body).toEqual(labelAddedBody))
        return true
      })
      .reply(200)

    await probot.receive({ name: "issues", payload })
  })

  test('creates the "needs triage" label first if it doesn\'t already exist', async (done) => {
    // return a test token
    nock(baseUrl)
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })

    // reply with 404 for label
    nock(baseUrl)
      .get(`/repos/${owner}/${repo}/labels/needs%20triage`)
      .reply(404)

    // test that the label is created
    nock(baseUrl)
      .post(`/repos/${owner}/${repo}/labels`, (body) => {
        done(expect(body).toMatchObject(labelCreatedBody))
        return true
      })
      .reply(200)

    await probot.receive({ name: "issues", payload })
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
