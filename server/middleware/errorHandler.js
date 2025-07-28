const errorHandler = (err, req, res, next) => {
  console.error("Server error:", err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Spezifische Fehlerbehandlung
  if (err.code === 'ECONNRESET') {
    return res.status(408).json({
      error: "Request timeout",
      timestamp: new Date().toISOString()
    });
  }
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: "Validation failed",
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorHandler;