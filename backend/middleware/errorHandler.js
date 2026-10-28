const errorHandler = (err, req, res, next) => {
  console.error('[!] API Error Handler Caught:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    source: 'error_boundary',
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
