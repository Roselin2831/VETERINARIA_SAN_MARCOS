import {
  readProducts,
  readOrders,
  createProduct,
  updateProduct,
  deleteProduct,
  registerUser,
  authenticate,
  createOrder,
  resetDatabase,
} from "../src/data/mockDb.js";

describe("Veterinaria San Marcos - Pruebas unitarias", () => {
  let datosGuardados;

  beforeEach(() => {
    // Cada prueba comienza con datos independientes
    datosGuardados = {};

    spyOn(localStorage, "getItem").and.callFake((clave) => {
      return datosGuardados[clave] ?? null;
    });

    spyOn(localStorage, "setItem").and.callFake((clave, valor) => {
      datosGuardados[clave] = valor;
    });

    spyOn(localStorage, "removeItem").and.callFake((clave) => {
      delete datosGuardados[clave];
    });

    resetDatabase();
  });

  it("CP-01: muestra los productos iniciales", () => {
    const productos = readProducts();

    expect(productos.length).toBe(6);
    expect(productos[0].name).toBe("Alimento perro adulto");
  });

  it("CP-02: crea un producto", () => {
    const cantidadInicial = readProducts().length;

    const producto = createProduct({
      name: "Collar para perro",
      category: "Accesorios",
      price: 5990,
      stock: 10,
      offer: false,
    });

    const productos = readProducts();

    expect(producto.name).toBe("Collar para perro");
    expect(productos.length).toBe(cantidadInicial + 1);
    expect(productos.some((item) => item.id === producto.id)).toBeTrue();
  });

  it("CP-03: actualiza el precio de un producto", () => {
    const actualizado = updateProduct("p1", {
      price: 15000,
    });

    expect(actualizado.price).toBe(15000);
  });

  it("CP-04: elimina un producto", () => {
    deleteProduct("p1");

    const existe = readProducts().some((producto) => producto.id === "p1");

    expect(existe).toBeFalse();
  });

  it("CP-05: convierte el precio a número", () => {
    const producto = createProduct({
      name: "Juguete para gato",
      price: "4500",
      stock: "5",
      offer: false,
    });

    expect(producto.price).toBe(4500);
    expect(producto.stock).toBe(5);
  });

  it("CP-06: registra un usuario", () => {
    const usuario = registerUser({
      name: "Cliente Prueba",
      email: "cliente@test.cl",
      password: "Prueba123!",
    });

    expect(usuario.role).toBe("customer");
    expect(usuario.email).toBe("cliente@test.cl");
    expect(usuario.password).toBeUndefined();
  });

  it("CP-07: rechaza correos duplicados", () => {
    const datos = {
      name: "Cliente",
      email: "cliente@test.cl",
      password: "Prueba123!",
    };

    registerUser(datos);

    expect(() => registerUser(datos)).toThrowError(
      "Este correo ya está registrado.",
    );
  });

  it("CP-08: permite iniciar sesión", () => {
    const usuario = authenticate("admin@sanmarcos.cl", "Admin123!");

    expect(usuario.role).toBe("admin");
    expect(usuario.password).toBeUndefined();
  });

  it("CP-09: rechaza una contraseña incorrecta", () => {
    expect(() => authenticate("admin@sanmarcos.cl", "incorrecta")).toThrowError(
      "Correo o contraseña incorrectos.",
    );
  });

  it("CP-10: registra un pedido", () => {
    const pedido = createOrder({
      customer: { name: "Cliente Prueba" },
      items: [{ id: "p1", quantity: 1 }],
      total: 18990,
    });

    expect(pedido.status).toBe("Confirmada");
    expect(readOrders().length).toBe(1);
    expect(readOrders()[0].id).toBe(pedido.id);
  });

  it("CP-11: rechaza un producto inexistente", () => {
    expect(() => {
      updateProduct("producto-inexistente", {
        price: 5000,
      });
    }).toThrowError("Producto no encontrado.");
  });

  it("CP-12: conserva el precio al cambiar el stock", () => {
    const producto = readProducts()[0];

    const actualizado = updateProduct(producto.id, {
      stock: 25,
    });

    expect(actualizado.price).toBe(producto.price);
    expect(actualizado.stock).toBe(25);
  });

  it("CP-13: rechaza un carrito vacío", () => {
    expect(() => {
      createOrder({
        customer: { name: "Cliente Prueba" },
        items: [],
        total: 0,
      });
    }).toThrowError("El carrito está vacío.");
  });
});
