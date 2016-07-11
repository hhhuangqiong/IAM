export function errorFormat(errors) {
  return errors.map(issue => `${issue.msg}`).join(', ');
}

export function errorResponse(errors, res) {
  res.status(400).json({
    message: 'Missing parameters',
    description: errorFormat(errors),
  });
}
