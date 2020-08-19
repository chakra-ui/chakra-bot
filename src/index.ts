import { Application } from "probot"
import triage from "./triage"

export = (app: Application) => {
  triage(app)
}
