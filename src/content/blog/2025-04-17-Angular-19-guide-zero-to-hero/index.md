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

## Introduccion

<div class="justified-text">
La siguiente guia proporciona una introducción a Angular 19, teniendo en cuenta las novedades y mejoras de la versión 19. Exploraremos los conceptos fundamentales de Angular y solo se pide como requisito conocimientos previos de Javascript, HTML y CSS.
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


## Instalacion de Angular

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


</div>

#### H4

##### H5

###### H6

## Paragraph

Xerum, quo qui aut unt expliquam qui dolut labo. Aque venitatiusda cum, voluptionse latur sitiae dolessi aut parist aut dollo enim qui voluptate ma dolestendit peritin re plis aut quas inctum laceat est volestemque commosa as cus endigna tectur, offic to cor sequas etum rerum idem sintibus eiur? Quianimin porecus evelectur, cum que nis nust voloribus ratem aut omnimi, sitatur? Quiatem. Nam, omnis sum am facea corem alique molestrunt et eos evelece arcillit ut aut eos eos nus, sin conecerem erum fuga. Ri oditatquam, ad quibus unda veliamenimin cusam et facea ipsamus es exerum sitate dolores editium rerore eost, temped molorro ratiae volorro te reribus dolorer sperchicium faceata tiustia prat.

Itatur? Quiatae cullecum rem ent aut odis in re eossequodi nonsequ idebis ne sapicia is sinveli squiatum, core et que aut hariosam ex eat.

## Images

### Syntax

```markdown
![Alt text](./full/or/relative/path/of/image)
```

### Output

![blog placeholder](/blog-placeholder-about.jpg)

## Blockquotes

The blockquote element represents content that is quoted from another source, optionally with a citation which must be within a `footer` or `cite` element, and optionally with in-line changes such as annotations and abbreviations.

### Blockquote without attribution

#### Syntax

```markdown
> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  
> **Note** that you can use _Markdown syntax_ within a blockquote.
```

#### Output

> Tiam, ad mint andaepu dandae nostion secatur sequo quae.  
> **Note** that you can use _Markdown syntax_ within a blockquote.

### Blockquote with attribution

#### Syntax

```markdown
> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>
```

#### Output

> Don't communicate by sharing memory, share memory by communicating.<br>
> — <cite>Rob Pike[^1]</cite>

[^1]: The above quote is excerpted from Rob Pike's [talk](https://www.youtube.com/watch?v=PAAkCSZUG1c) during Gopherfest, November 18, 2015.

## Tables

### Syntax

```markdown
| Italics   | Bold     | Code   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |
```

### Output

| Italics   | Bold     | Code   |
| --------- | -------- | ------ |
| _italics_ | **bold** | `code` |

## Code Blocks

### Syntax

we can use 3 backticks ``` in new line and write snippet and close with 3 backticks on new line and to highlight language specific syntax, write one word of language name after first 3 backticks, for eg. html, javascript, css, markdown, typescript, txt, bash

````markdown
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```
````

### Output

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Example HTML5 Document</title>
  </head>
  <body>
    <p>Test</p>
  </body>
</html>
```

## List Types

### Ordered List

#### Syntax

```markdown
1. First item
2. Second item
3. Third item
```

#### Output

1. First item
2. Second item
3. Third item

### Unordered List

#### Syntax

```markdown
- List item
- Another item
- And another item
```

#### Output

- List item
- Another item
- And another item

### Nested list

#### Syntax

```markdown
- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese
```

#### Output

- Fruit
  - Apple
  - Orange
  - Banana
- Dairy
  - Milk
  - Cheese

## Other Elements — abbr, sub, sup, kbd, mark

### Syntax

```markdown
<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

Press <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> to end the session.

Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.
```

### Output

<abbr title="Graphics Interchange Format">GIF</abbr> is a bitmap image format.

H<sub>2</sub>O

X<sup>n</sup> + Y<sup>n</sup> = Z<sup>n</sup>

Press <kbd>CTRL</kbd> + <kbd>ALT</kbd> + <kbd>Delete</kbd> to end the session.

Most <mark>salamanders</mark> are nocturnal, and hunt for insects, worms, and other small creatures.
