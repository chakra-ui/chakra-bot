import { Application, Context } from "probot"

/**
 * Checks to see if the "needs triage" label already exists on the repository.
 * If not, it will create it as a white label.
 */
const ensureLabelExists = async (context: Context) => {
  try {
    await context.github.issues.getLabel(context.repo({ name: "needs triage" }))
  } catch (e) {
    await context.github.issues.createLabel(
      context.repo({ color: "ffffff", name: "needs triage" }),
    )
  }
}

/**
 * Adds the "needs triage" label to an issue. Ensures that the label exists
 * before adding it.
 */
const addLabelToIssue = async (context: Context) => {
  await ensureLabelExists(context)
  const label = context.issue({
    labels: ["needs triage"],
  })
  await context.github.issues.addLabels(label)
}

/** Triage-related app */
export = (app: Application) => {
  app.on("issues.opened", addLabelToIssue)
}
