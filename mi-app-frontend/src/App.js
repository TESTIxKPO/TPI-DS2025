import { useState } from 'react';
import ProductoForm from './componentes/ProductoForm';
import ListaProductos from './componentes/ListaProductos';

function App() {
  const [actualizar, setActualizar] = useState(false);

  const refrescar = () => setActualizar(!actualizar);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>📦 Gestión de Stock</h1>
      <ProductoForm onProductoAgregado={refrescar} />
      <ListaProductos actualizar={actualizar} />
    </div>
  );
}

export default App;

