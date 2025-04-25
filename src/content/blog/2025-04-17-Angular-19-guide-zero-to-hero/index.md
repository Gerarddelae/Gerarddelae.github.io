---
title: 'Angular 19 zero to hero'
seoTitle: 'A Definitive Guide to Angular 19'
slug: 'angular-19-guide'
description: 'Here is a sample of some basic Markdown syntax that can be used when writing Markdown content in Astro.'
pubDate: '2025-04-17'
updatedDate: '2025-04-17'
tags: ["Angular", "Guide"]
coverImage: './angular-19.jpg'
---

<style>
  .justified-text {
    text-align: justify;
  }
</style>

## Introducción

<div class="justified-text">
La siguiente guía proporciona una introducción a Angular 19, teniendo en cuenta las novedades y mejoras de la versión 19. Exploraremos los conceptos fundamentales de Angular y solo se pide como requisito conocimientos previos de Javascript, HTML y CSS.
</div>

## Arquitectura utilizada por angular

<div class="justified-text">
Angular es un framework de desarrollo de aplicaciones web desarrollado por Google. Se basa en el patrón de arquitectura de componentes y utiliza un enfoque de programación orientada a objetos. Angular utiliza el lenguaje de programación TypeScript, que es una extensión de JavaScript que agrega tipado estático y características avanzadas de programación.

Cada componente tiene:

- HTML (template)

- CSS/SCSS (estilos)

- TypeScript (lógica)

### Ejemplo de la Arquitectura
```typescript
// app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent { ... }
```

| Archivo | Descripción |
| ------- | ----------- |
| app.component.ts | Archivo TypeScript que contiene la lógica del componente, incluyendo propiedades, métodos y decoradores |
| app.component.css | Archivo de estilos que define la apariencia visual específica del componente |
| app.component.html | Archivo de plantilla HTML que define la estructura y el contenido visual del componente |
</div>


## Instalación de Angular

<div class="justified-text">
Para instalar Angular, se debe utilizar el comando.

```bash
npm install -g @angular/cli
```
Este comando instala Angular CLI de manera globalmente en el sistema operativo. Esto permite que Angular CLI se pueda utilizar en cualquier proyecto de Angular sin la necesidad de instalarlo en cada proyecto individualmente.

</div>

## Angular CLI

<div class="justified-text">
Angular CLI es una herramienta de línea de comandos que se utiliza para crear, desarrollar y construir aplicaciones Angular. Proporciona una serie de comandos que se pueden utilizar para crear componentes, servicios, directivas, módulos, rutas, entre otros.

```bash
ng new proyecto --standalone  # Proyecto moderno (Angular 19+)
ng g c componentes/header     # Genera componente en carpeta
ng serve --open              # Levanta servidor y abre navegador
```

## Componentes
Como se menciono anteriormente los componentes en angular están compuestos por 3 archivos: La plantilla HTML, los estilos en CSS y por ultimo la lógica en Typescript. Es importante mencionar que el nombre para utilizar un componente es el "selector" que se encuentra en el archivo de lógica _.ts_ ; hay que tener en cuenta que gracias a Angular CLI podemos crear componentes muy fácil desde la línea de comandos con:
```bash
ng g c nombre_componente
```

Además, la clase que se crea en el archivo de lógica es el nombre que se utiliza para poder importar y utilizar nuestros componentes dentro de otros. A continuación un ejemplo.

Primero definamos un componente hijo.

```typescript
// saludo.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-saludo',
  standalone: true,
  template: `<p>¡Hola desde el componente hijo!</p>`
})
export class SaludoComponent {}
```
Para poder utilizarlo desde un componente padre tenemos que exportarlo y luego agregarlo teniendo en cuenta el selector, como puede verse en el siguiente ejemplo. 

```typescript
// app.component.ts
import { Component } from '@angular/core';
import { SaludoComponent } from './saludo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SaludoComponent], // Importamos el componente hijo aquí
  template: `
    <h1>Mi App Angular 19</h1>
    <app-saludo></app-saludo> <!-- Usamos el componente hijo teniendo en cuenta el nombre del selector -->
  `
})
export class AppComponent {}
```

## Interpolación de datos.


</div>

