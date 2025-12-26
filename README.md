# 📊 TaskMaster- Gestor de Tareas con Estadísticas

> Aplicación web completa para gestión de tareas con múltiples vistas, estadísticas en tiempo real y calendario integrado

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](tu-url-deploy)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

## 🖥️ Capturas de Pantalla

### 🔹 Vista de Tablas (Lista)
<img width="1910" height="910" alt="image" src="https://github.com/user-attachments/assets/c57bbabe-cc97-4a44-a461-1f67488db5ff" />

*Tabla completa de todas las tareas con filtros por estado (All, Active, Completed) y prioridad. Ideal para ver muchos registros de forma ordenada.*

### 🔹 Vista de Tareas (Tarjetas)
<img width="1914" height="909" alt="image" src="https://github.com/user-attachments/assets/26704175-2ff2-4127-a36d-471e689c8f4e" />

*Interfaz en tarjetas donde cada tarea muestra título, descripción, fecha, prioridad y botones de acción (Marcar/Eliminar).*

### 🔹 Dashboard
<img width="1912" height="912" alt="image" src="https://github.com/user-attachments/assets/2814b533-e86b-4b45-a9f9-5c0c0da37ed7" />

 
*Panel de estadísticas en tiempo real: evolución de tareas creadas/completadas y distribución por prioridad (Alta, Media, Baja).*

### 🔹 Calendario Mensual
<img width="1914" height="908" alt="image" src="https://github.com/user-attachments/assets/92f611d9-aa22-4fa2-b44f-af3e4448d2ab" />

*Vista mensual interactiva donde las tareas aparecen en su fecha correspondiente. Ideal para planificar y visualizar tu carga semanal o mensual.*

---

## ✨ Características Principales

### 📊 Múltiples Vistas Sincronizadas
- **Dashboard**: Cards con tareas + gráficos estadísticos
- **Lista**: Vista tipo tabla con todas las tareas
- **Calendario**: Visualización mensual interactiva

### 🎯 Gestión de Tareas
- ✅ **CRUD Completo**: Crear, leer, actualizar y eliminar tareas
- 🎨 **Sistema de Prioridades**: Alta (rojo), Media (naranja), Baja (azul)
- 🔄 **Estados**: Active, Completed
- 📅 **Fechas**: Asignación de fechas de vencimiento
- 📝 **Descripción**: Título y descripción detallada

### 📈 Visualización de Datos
- **Gráfico de Evolución**: Líneas que muestran tareas creadas vs completadas
- **Gráfico de Distribución**: Circular con distribución por prioridad
- **Contador en Tiempo Real**: Tasks completed y active tasks en sidebar

### 🔍 Funcionalidades Adicionales
- 🔎 **Búsqueda en tiempo real** de tareas
- 🎛️ **Filtros**: All / Active / Completed
- 💾 **Persistencia**: Datos guardados en localStorage
- 🗓️ **Calendario funcional**: Agregar y visualizar tareas por fecha

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Vanilla JavaScript** | Lógica de aplicación y manipulación del DOM |
| **Chart.js** | Gráficos interactivos de estadísticas |
| **HTML5** | Estructura semántica |
| **CSS3** | Diseño y estilos |
| **localStorage API** | Persistencia de datos del lado del cliente |

---

## 🏗️ Arquitectura del Proyecto

```
task-manager-dashboard/
├── index.html              # Página principal
├── css/
│   └── styles.css          # Estilos globales
├── js/
│   ├── main.js             # Lógica principal y CRUD
│   ├── chart-config.js     # Configuración de Chart.js
│   ├── calendar.js         # Lógica del calendario
│   └── filters.js          # Sistema de filtros y búsqueda
├── assets/
│   └── screenshots/        # Capturas para README
└── README.md
```

---

## 🚀 Instalación y Uso

### Requisitos
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- No requiere instalación de dependencias

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/XxGisussxX/task-manager-dashboard.git
cd task-manager-dashboard
```

2. **Abrir con Live Server**
```bash
# Si usas VS Code con Live Server
# Click derecho en index.html → Open with Live Server

# O simplemente abre index.html en tu navegador
```

3. **¡Listo!** 🎉
La aplicación cargará automáticamente los datos guardados en localStorage.

---

## 💡 Cómo Funciona

### Persistencia de Datos
```javascript
// Guardar tareas en localStorage
const saveTasks = (tasks) => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

// Cargar tareas al iniciar
const loadTasks = () => {
  return JSON.parse(localStorage.getItem('tasks')) || [];
};
```

### Gráficos Dinámicos
Los gráficos se actualizan automáticamente cuando:
- Se crea una nueva tarea
- Se marca una tarea como completada
- Se cambia la prioridad de una tarea

### Sincronización de Vistas
Todas las vistas (Dashboard, Lista, Calendario) comparten el mismo estado:
```javascript
// Al actualizar una tarea, se refrescan todas las vistas
updateTask(taskId, newData) => {
  updateDashboard();
  updateListView();
  updateCalendar();
  updateCharts();
}
```

---

## 🎯 Desafíos Técnicos Resueltos

### 1. Gestión de Estado Compleja
**Problema**: Mantener 3 vistas sincronizadas con los mismos datos  
**Solución**: Arquitectura basada en eventos y función central de actualización

### 2. Gráficos Dinámicos
**Problema**: Chart.js requiere datos en formato específico  
**Solución**: Función de transformación de datos antes de renderizar

### 3. Calendario Funcional
**Problema**: Calcular días del mes y posicionar tareas correctamente  
**Solución**: Algoritmo de generación de calendario con Date API de JavaScript

### 4. Persistencia sin Backend
**Problema**: Guardar datos sin base de datos  
**Solución**: localStorage con JSON serialization

---

## 📱 Estado Actual

- ✅ **Funcionalidad**: 100% operativa
- ✅ **Persistencia**: localStorage implementado
- ✅ **Gráficos**: Chart.js integrado
- ✅ **Calendario**: Totalmente funcional
- 🔄 **Responsive**: En desarrollo (próxima versión)

---

## 🔮 Roadmap - Próximas Mejoras

### Versión 2.0
- [ ] Diseño responsive (mobile-first)
- [ ] Animaciones y transiciones
- [ ] Drag & drop para tareas
- [ ] Temas claro/oscuro

### Versión 3.0
- [ ] Notificaciones de tareas vencidas
- [ ] Subtareas anidadas
- [ ] Exportar/Importar datos (JSON/CSV)
- [ ] Estadísticas avanzadas (gráficos adicionales)

### Versión 4.0 (Backend)
- [ ] Autenticación de usuarios
- [ ] Base de datos (MongoDB/PostgreSQL)
- [ ] API REST con Node.js
- [ ] Sincronización en tiempo real

---

## 💻 Aprendizajes Clave

Este proyecto me permitió dominar:

- ✅ **Vanilla JavaScript avanzado**: Manipulación compleja del DOM sin frameworks
- ✅ **localStorage API**: Persistencia de datos estructurados
- ✅ **Chart.js**: Integración y configuración de librerías de terceros
- ✅ **Arquitectura de aplicaciones**: Separación de responsabilidades
- ✅ **Algoritmos de calendario**: Manejo de fechas y generación dinámica
- ✅ **Event-driven programming**: Sistema de eventos para sincronización
- ✅ **Data transformation**: Formateo de datos para diferentes vistas

---

## 🎨 Paleta de Colores

```css
/* Colores principales */
--primary-blue: #4169E1;
--background: #F5F7FA;
--sidebar-dark: #1E3A8A;

/* Sistema de prioridades */
--high-priority: #EF4444;    /* Rojo */
--medium-priority: #F59E0B;  /* Naranja */
--low-priority: #3B82F6;     /* Azul */

/* Estados */
--completed: #10B981;        /* Verde */
--active: #6B7280;           /* Gris */
```

---

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~800+ (JS, HTML, CSS)
- **Funciones principales**: 15+
- **Vistas diferentes**: 3 (Dashboard, Lista, Calendario)
- **Tipos de gráficos**: 2 (Líneas, Circular)

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios importantes:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👤 Autor

**Jesús David Santamaría Díaz**

- 🌐 GitHub: [@XxGisussxX](https://github.com/XxGisussxX)
- 💼 LinkedIn: [jesus-santamaria](https://www.linkedin.com/in/jesus-santamaria-4816381b0/)
- 📧 Email: jesussantamariadiaz299@gmail.com
- 📍 Ubicación: Cali, Colombia

---

## 🙏 Agradecimientos

- [Chart.js Documentation](https://www.chartjs.org/) - Librería de gráficos
- [MDN Web Docs](https://developer.mozilla.org/) - Referencia de Web APIs
- [JavaScript.info](https://javascript.info/) - Guía avanzada de JavaScript

---

<div align="center">

⭐ **Si este proyecto te fue útil, considera darle una estrella** ⭐

Hecho con ❤️ y ☕ en Cali, Colombia

![Visitor Count](https://profile-counter.glitch.me/XxGisussxX-taskmanager/count.svg)

</div>
