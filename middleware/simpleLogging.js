// Middleware simple para logging de peticiones
function simpleLogging(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || '';
  
  // Capturar la respuesta original
  const originalSend = res.send;
  
  // Sobrescribir el método send para capturar la respuesta
  res.send = function(body) {
    res.send = originalSend;
    return res.send(body);
  };
  
  // Escuchar el evento finish para registrar cuando la respuesta se ha enviado completamente
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Registrar información de la petición
    console.log(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip} - ${userAgent}`);
  });
  
  next();
}

module.exports = simpleLogging;