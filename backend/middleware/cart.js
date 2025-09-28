

// Middleware para validar parámetros numéricos
export const validateNumericParam = (paramName) => {
  return (req, res, next) => {
    const value = req.params[paramName];
    if (value && (isNaN(value) || parseInt(value) <= 0)) {
      return res.status(400).json({
        success: false,
        message: `${paramName} debe ser un número válido mayor a 0`
      });
    }
    next();
  };
};

// Middleware para validar datos del body al agregar productos
export const validateAddToCart = (req, res, next) => {
  const { id_producto, cantidad } = req.body;


  // Validar id_producto
  if (!id_producto) {

    return res.status(400).json({
      success: false,
      message: "El ID del producto es requerido"
    });
  }

  if (isNaN(id_producto) || parseInt(id_producto) <= 0) {

    return res.status(400).json({
      success: false,
      message: "El ID del producto debe ser un número válido mayor a 0"
    });
  }

  // Validar cantidad (opcional, por defecto 1)
  if (cantidad !== undefined) {
    if (isNaN(cantidad) || parseInt(cantidad) <= 0) {

      return res.status(400).json({
        success: false,
        message: "La cantidad debe ser un número válido mayor a 0"
      });
    }

    if (parseInt(cantidad) > 100) {

      return res.status(400).json({
        success: false,
        message: "La cantidad no puede ser mayor a 100 unidades"
      });
    }
  }


  next();
};

// Middleware para validar datos al actualizar cantidad
export const validateUpdateCart = (req, res, next) => {
  const { cantidad } = req.body;

  if (!cantidad) {
    return res.status(400).json({
      success: false,
      message: "La cantidad es requerida"
    });
  }

  if (isNaN(cantidad) || parseInt(cantidad) <= 0) {
    return res.status(400).json({
      success: false,
      message: "La cantidad debe ser un número válido mayor a 0"
    });
  }

  if (parseInt(cantidad) > 100) {
    return res.status(400).json({
      success: false,
      message: "La cantidad no puede ser mayor a 100 unidades"
    });
  }

  next();
};

// Middleware para sanitizar datos de entrada
export const sanitizeCartData = (req, res, next) => {
  if (req.body.cantidad) {
    req.body.cantidad = parseInt(req.body.cantidad);
  }
  
  if (req.body.id_producto) {
    req.body.id_producto = parseInt(req.body.id_producto);
  }

  if (req.params.id_carrito) {
    req.params.id_carrito = parseInt(req.params.id_carrito);
  }

  next();
};

// Middleware para logging de acciones del carrito
export const logCartAction = (action) => {
  return (req, res, next) => {
    const userId = req.user?.id_usuario;
    const timestamp = new Date().toISOString();

    // Guardar la acción para logging posterior
    req.cartAction = {
      action,
      userId,
      timestamp,
      ip: req.ip
    };
    
    next();
  };
};

// Middleware para rate limiting simple del carrito
export const cartRateLimit = (() => {
  const userRequests = new Map();
  const WINDOW_MS = 60 * 1000; // 1 minuto
  const MAX_REQUESTS = 30; // máximo 30 requests por minuto por usuario

  return (req, res, next) => {
    const userId = req.user?.id_usuario;
    if (!userId) return next();

    const now = Date.now();
    const userKey = `cart_${userId}`;
    
    if (!userRequests.has(userKey)) {
      userRequests.set(userKey, { count: 1, resetTime: now + WINDOW_MS });
      return next();
    }

    const userData = userRequests.get(userKey);
    
    if (now > userData.resetTime) {
      userData.count = 1;
      userData.resetTime = now + WINDOW_MS;
      return next();
    }

    if (userData.count >= MAX_REQUESTS) {
      return res.status(429).json({
        success: false,
        message: "Demasiadas solicitudes al carrito. Intenta de nuevo en un minuto."
      });
    }

    userData.count++;
    next();
  };
})();

// Middleware de respuesta exitosa con logging
export const handleCartSuccess = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(body) {
    if (req.cartAction && body.success) {
    }
    return originalJson.call(this, body);
  };
  
  next();
};