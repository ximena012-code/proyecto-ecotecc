import React, { useState, useEffect } from "react"; // 👈 agrega useEffect
import axios from "axios";
import DashboardProductos from "./DashboardProductos";
import "../style/Productos.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link } from "react-router-dom";

const Productos = () => {
  const [selectedCategory, setSelectedCategory] = useState("Celulares"); // 👈 inicia en Celulares
  const [view, setView] = useState("productos");
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [editFormErrors, setEditFormErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [newProduct, setNewProduct] = useState({
    nombre: "",
    descripcion: "",
    cantidad: "",
    precio: "",
    codigo: "",
    foto: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchCode, setSearchCode] = useState("");

  const categoryToSlug = {
    Celulares: "celulares",
    Tablets: "tablets",
    Computadores: "portatiles",
    "Relojes Inteligentes": "relojes",
    Audio: "audio",
    Promociones: "promociones",
    Reacondicionados: "reacondicionados",
  };

  const handleCategoryClick = async (category) => {
    setSelectedCategory(category);
    setView("productos");

    const slug = categoryToSlug[category];
    if (!slug) return;

    try {
      const response = await axios.get(
        `https://ecotec-backend.onrender.com/api/productos/categoria/slug/${slug}`
      );
      const productosConId = response.data.map((producto) => ({
        ...producto,
        id: producto.id_producto,
      }));
      setProducts(productosConId);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  // 👇 Esto carga celulares al entrar
  useEffect(() => {
    handleCategoryClick("Celulares");
  }, []);

  const enableEdit = (product) => setEditProduct(product);

  const handleEditChange = (event, field) =>
    setEditProduct({ ...editProduct, [field]: event.target.value });

  // === Guardar edición ===
  const saveEdit = async () => {
    const token = localStorage.getItem("token");
    const errors = {};

    if (!editProduct.nombre) errors.nombre = "El nombre es obligatorio.";
    if (!editProduct.descripcion)
      errors.descripcion = "La descripción es obligatoria.";
    if (!editProduct.cantidad || Number(editProduct.cantidad) <= 0)
      errors.cantidad = "Cantidad debe ser un número positivo.";
    if (!editProduct.precio || Number(editProduct.precio) <= 0)
      errors.precio = "Precio debe ser un número positivo.";
    if (!editProduct.codigo) errors.codigo = "El código es obligatorio.";
    if (!selectedCategory) errors.categoria = "Selecciona una categoría.";

    setEditFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axios.put(
        `https://ecotec-backend.onrender.com/api/productos/${editProduct.id}`,
        {
          nombre: editProduct.nombre,
          descripcion: editProduct.descripcion,
          cantidad: editProduct.cantidad,
          precio: editProduct.precio,
          codigo: editProduct.codigo,
          categoria: selectedCategory,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      handleCategoryClick(selectedCategory);
      setEditProduct(null);
      setEditFormErrors({});
    } catch (error) {
      console.error("Error al actualizar producto:", error);
    }
  };

  // === Eliminar ===
  const confirmDeleteProduct = (productId) => {
    setProductToDelete(productId);
    setShowConfirm(true);
  };

  const proceedDeleteProduct = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(
        `https://ecotec-backend.onrender.com/api/productos/${productToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleCategoryClick(selectedCategory);
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    } finally {
      setShowConfirm(false);
      setProductToDelete(null);
    }
  };

  // === Añadir ===
  const handleAddChange = (event, field) => {
    if (field === "foto") {
      setNewProduct({ ...newProduct, [field]: event.target.files[0] });
    } else {
      setNewProduct({ ...newProduct, [field]: event.target.value });
    }
  };

  const addProduct = async () => {
    const { nombre, descripcion, cantidad, precio, codigo, foto } = newProduct;
    const errors = {};

    if (!nombre) errors.nombre = "El nombre es obligatorio.";
    if (!descripcion) errors.descripcion = "La descripción es obligatoria.";
    if (!cantidad || Number(cantidad) <= 0)
      errors.cantidad = "Cantidad debe ser un número positivo.";
    if (!precio || Number(precio) <= 0)
      errors.precio = "Precio debe ser un número positivo.";
    if (!codigo) errors.codigo = "El código es obligatorio.";
    if (!foto) errors.foto = "La imagen es obligatoria.";
    if (!selectedCategory) errors.categoria = "Selecciona una categoría.";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("descripcion", descripcion);
    formData.append("cantidad", cantidad);
    formData.append("precio", precio);
    formData.append("codigo", codigo);
    formData.append("categoria", selectedCategory);
    formData.append("imagen", foto);

    const token = localStorage.getItem("token");

    try {
      await axios.post("https://ecotec-backend.onrender.com/api/productos/add", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      handleCategoryClick(selectedCategory);
      setShowAddForm(false);
      setNewProduct({
        nombre: "",
        descripcion: "",
        cantidad: "",
        precio: "",
        codigo: "",
        foto: null,
      });
      setFormErrors({});
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setFormErrors((prev) => ({
          ...prev,
          codigo: "El código ya está registrado.",
        }));
      } else {
        alert("Error al agregar producto");
      }
    }
  };

  // === Filtrado ===
  const filteredProducts = products.filter((product) =>
    product.codigo.toLowerCase().includes(searchCode.toLowerCase())
  );

  return (
    <div className="productos-container">
      <div className="productos-wrapper">
        {/* HEADER */}
        <div className="productos-header">
          <h1 className="productos-title">Productos</h1>
          {selectedCategory && (
            <div className="productos-search-bar">
              <input
                type="text"
                placeholder="Buscar por código..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="productos-sidebar">
          <ul className="productos-list-group">
            <h3>Categoría</h3>
            {[
              "Celulares",
              "Tablets",
              "Computadores",
              "Relojes Inteligentes",
              "Audio",
              "Reacondicionados",
              "Promociones",
            ].map((cat) => (
              <li key={cat} onClick={() => handleCategoryClick(cat)}>
                <a href="#">{cat}</a>
              </li>
            ))}
            <li
              onClick={() => setView("dashboard")}
              style={{ marginTop: "20px", fontWeight: "bold" }}
            >
              <a href="#">Dashboard Productos</a>
            </li>
          </ul>
        </aside>

        {/* CONTENIDO */}
        <div className="productos-information-box">
          {view === "productos" ? (
            selectedCategory ? (
              <>
                <h3>{selectedCategory}</h3>
                {filteredProducts.length > 0 ? (
                  <table className="productos-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Código</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            {product.foto ? (
                              <img
                                src={`https://ecotec-backend.onrender.com/uploads/${product.foto}`}
                                alt={product.nombre}
                                className="productos-photo"
                              />
                            ) : (
                              "Sin imagen"
                            )}
                          </td>
                          <td>
                            {editProduct?.id === product.id ? (
                              <input
                                type="text"
                                value={editProduct.nombre}
                                onChange={(e) =>
                                  handleEditChange(e, "nombre")
                                }
                              />
                            ) : (
                              product.nombre
                            )}
                          </td>
                          <td>
                            {editProduct?.id === product.id ? (
                              <input
                                type="text"
                                value={editProduct.descripcion}
                                onChange={(e) =>
                                  handleEditChange(e, "descripcion")
                                }
                              />
                            ) : (
                              product.descripcion
                            )}
                          </td>
                          <td>
                            {editProduct?.id === product.id ? (
                              <input
                                type="number"
                                value={editProduct.cantidad}
                                onChange={(e) =>
                                  handleEditChange(e, "cantidad")
                                }
                              />
                            ) : (
                              product.cantidad
                            )}
                          </td>
                          <td>
                            {editProduct?.id === product.id ? (
                              <input
                                type="number"
                                value={editProduct.precio}
                                onChange={(e) =>
                                  handleEditChange(e, "precio")
                                }
                              />
                            ) : (
                              new Intl.NumberFormat("es-CO", {
                                style: "currency",
                                currency: "COP",
                              }).format(product.precio)
                            )}
                          </td>
                          <td>{product.codigo}</td>
                          <td>
                            {editProduct?.id === product.id ? (
                              <button
                                onClick={saveEdit}
                                className="productos-save-button"
                              >
                                Guardar
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => enableEdit(product)}
                                  className="productos-action-icon"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  onClick={() =>
                                    confirmDeleteProduct(product.id)
                                  }
                                  className="productos-action-icon"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No hay productos en esta categoría.</p>
                )}

                {/* FORMULARIO DE AÑADIR */}
                <button  className="productos-button"  onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? "Cancelar" : "Agregar Producto"}
                </button>
                {showAddForm && (
                  <div className="productos-add-form">
                    {[
                      { field: "nombre", type: "text", placeholder: "Nombre" },
                      {
                        field: "descripcion",
                        type: "text",
                        placeholder: "Descripción",
                      },
                      {
                        field: "cantidad",
                        type: "number",
                        placeholder: "Cantidad",
                      },
                      {
                        field: "precio",
                        type: "number",
                        placeholder: "Precio",
                      },
                      { field: "codigo", type: "text", placeholder: "Código" },
                    ].map(({ field, type, placeholder }) => (
                      <div className="productos-form-group" key={field}>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={newProduct[field]}
                          onChange={(e) => handleAddChange(e, field)}
                        />
                        {formErrors[field] && (
                          <p className="productos-error-message">
                            {formErrors[field]}
                          </p>
                        )}
                      </div>
                    ))}
                    <div className="productos-form-group">
                      <input
                        type="file"
                        onChange={(e) => handleAddChange(e, "foto")}
                      />
                      {formErrors.foto && (
                        <p className="productos-error-message">{formErrors.foto}</p>
                      )}
                    </div>
                    <button className="productos-add-button" onClick={addProduct}>
                      Agregar
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p>Selecciona una categoría para ver productos.</p>
            )
          ) : (
            <DashboardProductos />
          )}
        </div>
      </div>
        {/* 🔹 Botón para volver */}
  <div className="back-to-dashboard3">
<Link to="/dashboardadmi">← Volver a mi cuenta</Link>
  </div>

      {/* Modal de confirmación */}
      {showConfirm && (
        <div className="productos-confirm-overlay">
          <div className="productos-confirm-box">
            <h3>¿Eliminar producto?</h3>
            <button  className="productos-button" onClick={proceedDeleteProduct}>Sí, eliminar</button>
            <button onClick={() => setShowConfirm(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
    
  );
};

export default Productos;