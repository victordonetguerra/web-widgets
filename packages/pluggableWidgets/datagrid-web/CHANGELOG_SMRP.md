# CHANGELOG_SMRP

> Proyecto: Personalización del widget oficial **Data Grid 2** de Mendix para SmarterMRP.

---

# Información general

## Widget base

- Repositorio: https://github.com/mendix/web-widgets
- Widget: Data Grid 2
- Ruta:

```
packages/pluggableWidgets/datagrid-web
```

## Rama recomendada

```
smrp/datagrid-top-scroll
```

---

# Objetivo

Mantener el 100% del comportamiento original del Data Grid 2 incorporando una nueva funcionalidad:

- Barra de desplazamiento horizontal superior.
- Sincronización completa con la barra inferior.
- Activable mediante una propiedad del widget.
- Sin afectar a filtros, ordenación, paginación, selección, edición ni virtual scrolling.

---

# Cambios realizados

## 1. Datagrid.xml

### Archivo

```
src/Datagrid.xml
```

### Nuevo parámetro

Se añadió una propiedad nueva al widget.

```xml
<property
    key="showTopScrollbar"
    type="boolean"
    defaultValue="true">
```

Caption:

```
Show top horizontal scrollbar
```

Descripción:

```
Shows a synchronized horizontal scrollbar above the data grid.
```

Esta propiedad aparece en Studio Pro y permite activar o desactivar la barra superior para cada Data Grid.

---

## 2. Datagrid.tsx

### Archivo

```
src/Datagrid.tsx
```

Se añadió la propagación de la nueva propiedad.

Antes:

```tsx
<Widget onExportCancel={abortExport} />
```

Ahora:

```tsx
<Widget onExportCancel={abortExport} showTopScrollbar={props.showTopScrollbar} />
```

---

## 3. Widget.tsx

### Archivo

```
src/components/Widget.tsx
```

Se modificó la interfaz del componente.

Antes:

```tsx
export function Widget(props: { onExportCancel?: () => void });
```

Ahora:

```tsx
export function Widget(props: { onExportCancel?: () => void; showTopScrollbar: boolean });
```

La propiedad únicamente se pasa a WidgetContent.

```tsx
<WidgetContent
    showTopScrollbar={props.showTopScrollbar}
>
```

Grid ya no necesita conocer esta propiedad.

---

## 4. WidgetContent.tsx

### Archivo

```
src/components/WidgetContent.tsx
```

Este es el archivo principal de la personalización.

Aquí se implementó completamente:

- Barra superior.
- Sincronización bidireccional.
- ResizeObserver.
- Actualización automática del ancho.
- Sincronización del scroll.

### Arquitectura

Antes:

```
WidgetContent
    Grid
```

Ahora:

```
WidgetContent
│
├── Top Horizontal Scrollbar
│
└── widget-datagrid-content
        │
        └── Grid
```

Toda la lógica del scroll reside aquí.

---

## 5. Grid.tsx

Después de múltiples iteraciones se decidió volver prácticamente al código original.

Las primeras implementaciones intentaban controlar el scroll desde Grid.

Problemas encontrados:

- Grid no es el verdadero contenedor scrollable.
- El scroll real pertenece a:

```
.widget-datagrid-content
```

Por tanto Grid vuelve prácticamente al código oficial.

Esto facilita futuras actualizaciones desde Mendix.

---

## 6. test-utils.tsx

Fue necesario añadir:

```ts
showTopScrollbar: true;
```

a los objetos simulados utilizados durante la compilación para que TypeScript generase correctamente los typings.

---

# Investigación realizada

Durante el desarrollo se comprobaron varias aproximaciones.

## Opción 1

Scrollbar implementado dentro de Grid.

Resultado:

❌ descartada.

Motivos:

- sincronización complicada
- múltiples ResizeObserver
- diferencias entre scrollWidth y clientWidth

---

## Opción 2

Scrollbar implementado mediante un componente independiente.

Resultado:

❌ descartada.

Motivos:

- problemas de renderizado
- problemas de sincronización

---

## Opción 3

Scrollbar implementado dentro de WidgetContent.

Resultado:

✅ solución adoptada.

Ventajas:

- reutiliza el contenedor scrollable oficial
- mínima modificación del código Mendix
- mucho más sencilla de mantener

---

# Archivos modificados

```
src/Datagrid.xml

src/Datagrid.tsx

src/components/Widget.tsx

src/components/WidgetContent.tsx

src/utils/test-utils.tsx
```

---

# Archivos finalmente NO modificados

```
src/components/Grid.tsx
```

Aunque se realizaron numerosas pruebas, finalmente se restauró prácticamente a su implementación original.

---

# Compilación

```
pnpm --filter @mendix/datagrid-web build
```

---

# Problema detectado en Windows

El proceso de build no genera correctamente el MPK.

El MPK generado contiene únicamente:

```
Datagrid.js
Datagrid.mjs
Datagrid.editorConfig.js
Datagrid.editorPreview.js
```

No incorpora automáticamente:

```
package.xml

Datagrid.xml

Datagrid.icon.png

Datagrid.icon.dark.png

Datagrid.tile.png

Datagrid.tile.dark.png
```

Por tanto actualmente es necesario añadir estos archivos manualmente al MPK antes de utilizarlo en Studio Pro.

---

# Estado funcional actual

Verificado:

✅ Scroll horizontal superior.

✅ Scroll horizontal inferior.

✅ Sincronización superior → inferior.

✅ Sincronización inferior → superior.

✅ Compatible con filtros.

✅ Compatible con ordenación.

✅ Compatible con paginación.

✅ Compatible con selección.

✅ Compatible con personalización de columnas.

✅ Compatible con el asistente oficial de columnas de Mendix.

---

# Próximas mejoras

## Mejorar apariencia

- Igualar exactamente el grosor de ambas barras.
- Igualar completamente el estilo visual del scrollbar inferior.

---

## Mejorar empaquetado

Investigar por qué el build oficial de Windows no incorpora automáticamente:

- package.xml
- iconos
- Datagrid.xml

para evitar tener que modificar manualmente el MPK.

---

## Estrategia de mantenimiento

Para actualizar el widget cuando Mendix publique una nueva versión:

```
git checkout main

git pull

git checkout smrp/datagrid-top-scroll

git rebase main
```

Resolver conflictos únicamente en los archivos modificados por SmarterMRP.

Volver a compilar.

Probar.

Generar nuevo MPK.

---

# Historial

**Versión SMRP 1.0**

- Primera implementación estable del scroll horizontal superior sincronizado para Data Grid 2.
- Compatible con Mendix Studio Pro.
- Mantiene el comportamiento original del widget oficial.

# Versión SMRP 1.0.1

## Corrección

Se resolvió un problema detectado al modificar la visibilidad de columnas ("Can hide = Yes", "Hidden by default") cuando estaba habilitada la barra de desplazamiento superior.

### Síntomas

Al mostrar u ocultar columnas desde el selector del Data Grid 2 aparecía una excepción del Runtime de Mendix:

```text
Unable to find objects for guids: [...]
CommitExecutor.apply(...)
```

La excepción únicamente se producía cuando estaba activada la barra de desplazamiento superior.

### Causa

La primera implementación almacenaba el ancho del scrollbar superior mediante `useState`.

Cada vez que `ResizeObserver` detectaba un cambio de tamaño del Data Grid, se ejecutaba:

```ts
setScrollWidth(...)
```

Esto provocaba un nuevo render de `WidgetContent` mientras Mendix estaba actualizando el estado interno del Data Grid durante la personalización de columnas, invalidando referencias internas del cliente y produciendo el error de GUID inexistente.

### Solución

Se eliminó completamente el uso de estado React (`useState`) para el scrollbar superior.

El ancho del scrollbar se actualiza ahora de forma imperativa mediante referencias (`useRef`) sobre el elemento DOM.

La sincronización del scroll continúa siendo bidireccional, pero sin provocar renders adicionales del componente.

### Beneficios

- Eliminación de renders innecesarios.
- Mayor estabilidad durante la personalización de columnas.
- Sincronización más eficiente.
- Desaparece la excepción `Unable to find objects for guids`.
- Menor carga de renderizado de React.

Estado:

✅ Corregido y verificado.
