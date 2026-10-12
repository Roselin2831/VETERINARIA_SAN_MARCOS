
import React from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";

import ProductCard from "../src/components/ProductCard.jsx";
import {
  ShopProvider,
  useShop,
} from "../src/context/ShopContext.jsx";

// Producto utilizado en las pruebas
const productoPrueba = {
  id: "p-test",
  name: "Alimento para perro",
  category: "Alimentos",
  price: 12990,
  stock: 5,
  offer: true,
  description: "Alimento de prueba",
  emoji: "🐶",
};

// Componente para comprobar el contador del carrito
function ContadorCarrito() {
  const { cartCount } = useShop();

  return (
    <span data-testid="contador-carrito">
      {cartCount}
    </span>
  );
}

// Mostrar producto utilizando el contexto real de React
function mostrarProducto(producto = productoPrueba) {
  return render(
    <ShopProvider>
      <ProductCard product={producto} />
      <ContadorCarrito />
    </ShopProvider>
  );
}

describe("ProductCard - Pruebas de React", () => {

  beforeEach(() => {
    // Reiniciar la información usada por las pruebas
    localStorage.removeItem("san-marcos-store-v2");
    localStorage.removeItem("san-marcos-cart-v2");
    sessionStorage.removeItem("san-marcos-user");
  });

  afterEach(() => {
    // Desmontar componentes después de cada prueba
    cleanup();

    localStorage.removeItem("san-marcos-store-v2");
    localStorage.removeItem("san-marcos-cart-v2");
    sessionStorage.removeItem("san-marcos-user");
  });

  it("CP-14: muestra el nombre y precio del producto", () => {
    mostrarProducto();

    expect(
      screen.getByText("Alimento para perro")
    ).toBeTruthy();

    expect(
      screen.getByText(/12\.990/)
    ).toBeTruthy();
  });

  it("CP-15: muestra la etiqueta de oferta", () => {
    mostrarProducto();

    expect(
      screen.getByText("Oferta")
    ).toBeTruthy();
  });

  it("CP-16: deshabilita el botón cuando no hay stock", () => {
    mostrarProducto({
      ...productoPrueba,
      stock: 0,
    });

    const boton = screen.getByRole("button", {
      name: "Sin stock",
    });

    expect(boton.disabled).toBeTrue();
  });

  it("CP-17: agrega un producto al carrito", () => {
    mostrarProducto();

    const boton = screen.getByRole("button", {
      name: "Agregar",
    });

    fireEvent.click(boton);

    expect(
      screen.getByTestId("contador-carrito").textContent
    ).toBe("1");
  });

});
