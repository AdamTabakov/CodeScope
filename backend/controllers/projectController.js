import { saveProject, listProjects, getProject, deleteProject } from '../services/projectService.js'

export async function saveProjectEndpoint(req, res, next) {
  try {
    const project = await saveProject(req.user.sub, req.body ?? {})
    res.status(200).json({ project })
  } catch (err) {
    if (err.message === 'Project requires a repository URL and full name.') {
      return res.status(400).json({ error: err.message })
    }
    next(err)
  }
}

export async function listProjectsEndpoint(req, res, next) {
  try {
    const projects = await listProjects(req.user.sub)
    res.status(200).json({ projects })
  } catch (err) {
    next(err)
  }
}

export async function getProjectEndpoint(req, res, next) {
  try {
    const project = await getProject(req.user.sub, req.params.id)
    res.status(200).json({ project })
  } catch (err) {
    if (err.message === 'Project not found.') {
      return res.status(404).json({ error: 'Project not found.' })
    }
    next(err)
  }
}

export async function deleteProjectEndpoint(req, res, next) {
  try {
    await deleteProject(req.user.sub, req.params.id)
    res.status(200).json({ ok: true })
  } catch (err) {
    if (err.message === 'Project not found.') {
      return res.status(404).json({ error: 'Project not found.' })
    }
    next(err)
  }
}