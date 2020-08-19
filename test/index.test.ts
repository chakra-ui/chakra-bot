import nock from "nock"
import myProbotApp from "../src"
import { Probot } from "probot"
import payload from "./fixtures/issues.opened.json"
const issueCreatedBody = { body: "Thanks for opening this issue!" }
const fs = require("fs")
const path = require("path")

describe("My Probot app", () => {
  let probot: any
  let mockCert: string

  beforeAll((done: Function) => {
    fs.readFile(
      path.join(__dirname, "fixtures/mock-cert.pem"),
      (err: Error, cert: string) => {
        if (err) return done(err)
        mockCert = cert
        done()
      },
    )
  })

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({ id: 123, cert: mockCert })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test("creates a comment when an issue is opened", async (done) => {
    // Test that we correctly return a test token
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" })

    // Test that a comment is posted
    nock("https://api.github.com")
      .post("/repos/hiimbex/testing-things/issues/1/comments", (body: any) => {
        done(expect(body).toMatchObject(issueCreatedBody))
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: "issues", payload })
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })
})
