---
title: 'Revisión Profunda de Domain-Driven Design — Aplicado a una Flota de Logística'
description: 'Una guía exhaustiva sobre DDD: desde los fundamentos estratégicos hasta la implementación táctica, todo aplicado al dominio concreto de la gestión de flotas logísticas'
coverImage: ./1.png
tags:
  - DDD
  - Arquitectura
  - Diseño de Software
  - Domain-Driven Design
  - Flota Logística
pubDate: 2026-04-29
---

## 1. Introducción a Domain-Driven Design

Domain-Driven Design (DDD) es una aproximación al desarrollo de software cuyo principio cardinal sostiene que la complejidad inherente a los sistemas de software no reside en la tecnología, sino en el dominio de negocio que estos modelan. Esta perspectiva fue formalizada por Eric Evans en su obra seminal Domain-Driven Design: Tackling Complexity in the Heart of Software (2003), donde argumenta que el éxito de un proyecto de software depende, antes que de cualquier decisión tecnológica, de la profundidad con la que el equipo de desarrollo comprende el dominio del problema.

### 1.1 Orígenes y Filosofía

La filosofía de DDD se sustenta en tres pilares fundamentales. En primer lugar, la **centralidad del dominio**: la lógica de negocio debe ser el eje articulador de todo el diseño, y el código debe reflejar fielmente los conceptos, reglas y procesos del dominio. En segundo lugar, la **colaboración continua** entre expertos del dominio y desarrolladores: DDD rechaza la idea de que los requisitos se puedan transmitir mediante documentos estáticos y aboga por un diálogo permanente donde el conocimiento se destila de forma iterativa. En tercer lugar, la **modelización deliberada**: el modelo no es un subproducto del código, sino una abstracción conscientemente construida que sirve como lenguaje compartido y como estructura de la implementación.

El contexto histórico es relevante para comprender la propuesta de Evans. A principios de los 2000, la industria dominada por arquitecturas en capas rígidas y por la programación transaccional centrada en bases de datos relacionales producía sistemas donde la lógica de negocio se fragmentaba entre procedimientos almacenados, servicios genéricos y capas de presentación. DDD surgió como respuesta a esta fragmentación, proponiendo que el modelo de dominio —expresado en código orientado a objetos— fuera el corazón de la aplicación, encapsulando tanto los datos como el comportamiento del negocio.

### 1.2 Por qué DDD en Sistemas Complejos

No todos los proyectos de software se benefician por igual de DDD. Su adopción es particularmente justificada cuando el sistema presenta una complejidad de dominio elevada: múltiples actores con perspectivas diferentes, reglas de negocio intrincadas y cambiantes, procesos de negocio que cruzan límites organizacionales, y una necesidad de escalabilidad tanto técnica como organizacional. Un sistema de gestión de flota logística exhibe todas estas características: intervienen planificadores de rutas, conductores, operadores de almacén, clientes y administradores; las reglas de asignación, facturación y cumplimiento normativo son complejas; y el sistema debe integrar múltiples subdominios que evolucionan a ritmos diferentes.

DDD aporta dos dimensiones complementarias para abordar esta complejidad. La **dimensión estratégica** proporciona herramientas para descomponer el dominio en porciones manejables (Bounded Contexts), definir interfaces claras entre ellas (Context Mapping) y establecer un lenguaje compartido (Ubiquitous Language) que elimine ambigüedades. La **dimensión táctica** ofrece patrones de implementación —entidades, value objects, agregados, servicios de dominio, repositorios y eventos de dominio— que garantizan que el código refleje fielmente el modelo conceptual.

Es importante subrayar que DDD no es una metodología de desarrollo ni un marco tecnológico; es un conjunto de principios y patrones que guían las decisiones de diseño. Su valor se manifiesta cuando el equipo se compromete a invertir tiempo en entender el dominio, a colaborar estrechamente con los expertos de negocio y a mantener la integridad del modelo a lo largo de la evolución del sistema. En dominios simples o CRUD, esta inversión puede no justificarse; pero en dominios como la logística de flotas, donde una mala modelización puede generar inconsistencias operativas costosas, DDD se convierte en una ventaja estratégica.

---

## 2. Diseño Estratégico

La dimensión estratégica de DDD es la que permite abordar dominios grandes y complejos antes de descender a los detalles de implementación. Se centra en tres conceptos fundamentales: los Bounded Contexts, el lenguaje ubicuo y el Context Mapping.

### 2.1 Bounded Contexts

Un **Bounded Context** (Contexto Delimitado) es el concepto estratégico más importante de DDD. Se define como una frontera lingüística y arquitectónica dentro de la cual un modelo de dominio particular tiene un significado único y consistente. Fuera de esa frontera, los mismos términos pueden tener significados diferentes, y eso es no solo aceptable sino deseable: cada contexto existe para resolver un problema específico y debe optimizar su modelo para ese propósito.

La motivación central detrás de los Bounded Contexts es la constatación de que un modelo único para todo un dominio grande es inviable. Cuando se intenta mantener un modelo unificado para un sistema empresarial complejo, se produce lo que Evans denomina un **modelo monolítico**: un artefacto enorme donde cada cambio afecta a múltiples equipos, las definiciones se vuelven ambiguas por intentar cubrir todos los casos de uso, y la complejidad crece exponencialmente. Los Bounded Contexts rompen este ciclo al establecer que dentro de cada contexto, un término tiene una y solo una definición, y el modelo se optimiza para las operaciones de ese contexto.

La identificación de Bounded Contexts no es un ejercicio puramente técnico. Se basa en tres criterios complementarios: **organizacional** (diferentes equipos o departamentos tienden a corresponder a diferentes contextos), **lingüístico** (cuando el mismo término adquiere significados distintos según quién lo use, eso señala una frontera de contexto), y **operacional** (diferentes flujos de trabajo y ciclos de vida de objetos indican contextos separados). Un error frecuente es confundir Bounded Contexts con módulos técnicos o microservicios; un Bounded Context es una decisión de modelado, no una decisión de despliegue, aunque frecuentemente exista una correspondencia entre ambos.

### 2.2 Ubiquitous Language

El **Lenguaje Ubicuo** (Ubiquitous Language) es el tejido conectivo que mantiene unido un Bounded Context. Se trata de un lenguaje compartido entre desarrolladores y expertos del dominio que se utiliza de forma consistente en conversaciones, diagramas, documentos, código fuente y pruebas. El objetivo es eliminar las traducciones entre el lenguaje del negocio y el lenguaje técnico: cuando un experto de dominio dice "envío prioritario", el código debe contener exactamente esa expresión, no una codificación opaca como `type=1` o `priorityFlag=true`.

La construcción del lenguaje ubicuo es un proceso iterativo y colaborativo. No se trata de que los desarrolladores aprendan la jerga del negocio de forma pasiva, sino de un diálogo activo donde ambas partes refinan los términos hasta alcanzar definiciones precisas y no ambiguas. Este proceso de refinamiento es en sí mismo una actividad de modelado: al discutir qué significa exactamente "envío prioritario", el equipo descubre reglas de negocio, excepciones y casos límite que enriquecen el modelo.

El lenguaje ubicuo tiene implicaciones directas en el código. Los nombres de clases, métodos, propiedades y eventos deben reflejar los términos del lenguaje ubicuo. Cuando el código y el lenguaje del negocio divergen, se genera una **deuda de traducción**: cada persona que interactúa con el sistema debe realizar un esfuerzo cognitivo adicional para mapear entre dos vocabularios, lo que introduce errores y ralentiza el desarrollo.

### 2.3 Context Mapping y Patrones de Relación

El **Context Mapping** es la disciplina de mapear explícitamente las relaciones entre Bounded Contexts. Un mapa de contextos documenta cómo los equipos y sus modelos interactúan, qué dependencias existen y qué mecanismos de traducción se necesitan en las fronteras. Evans y posteriormente Vaughn Vernon identifican varios patrones que describen la naturaleza de estas relaciones:

| Patrón | Descripción | Cuándo usarlo |
|--------|-------------|----------------|
| **Shared Kernel** | Subconjunto del modelo compartido entre contextos | Cuando la coordinación es viable y el beneficio de compartir supera el costo del acoplamiento |
| **Conformist** | Un contexto se alinea completamente con el modelo de otro | Cuando el contexto aguas arriba es estable y bien diseñado |
| **Anti-Corruption Layer** | Capa de traducción que protege el modelo interno | Cuando se integra con sistemas legacy o externos sobre los que no se tiene control |
| **Open Host Service** | Protocolos estandarizados que cualquier contexto puede consumir | Cuando un contexto sirve a múltiples consumidores |
| **Published Language** | Formato estándar como lingua franca entre contextos | Para contratos explícitos y versionables |
| **Separate Ways** | No integrarse, duplicar funcionalidad si es necesario | Cuando el costo de la integración supera ampliamente el costo de la duplicación |
| **Customer-Supplier** | El proveedor tiene en cuenta las necesidades del cliente | Cuando hay una relación de dependencia negociable |

El mapa de contextos no es un artefacto estático; evoluciona con el sistema y debe ser revisado periódicamente. En la práctica, se representa como un diagrama donde cada Bounded Context es un nodo y las relaciones se anotan con el patrón correspondiente, indicando además la dirección de la dependencia (upstream/downstream).

---

## 3. Bloques Tácticos Fundamentales

La dimensión táctica de DDD proporciona los patrones de implementación que permiten materializar el modelo de dominio en código.

### 3.1 Entidades

Una **Entidad** es un objeto del modelo de dominio que se distingue por su identidad, no por sus atributos. Dos entidades pueden tener exactamente los mismos valores en todos sus atributos y seguir siendo objetos diferentes si poseen identidades distintas. Esta característica es fundamental en dominios como la logística: dos vehículos pueden tener la misma marca, modelo y año, pero siguen siendo entidades diferentes porque cada uno tiene una identidad propia —típicamente un identificador de flota o una matrícula— que los distingue a lo largo de todo su ciclo de vida.

La identidad de una entidad debe cumplir tres propiedades: **unicidad** (no existen dos entidades con la misma identidad dentro del mismo Bounded Context), **estabilidad** (la identidad no cambia durante la vida de la entidad) y **globalidad dentro del contexto** (la identidad es suficiente para localizar a la entidad dentro de su contexto). En la práctica, la identidad se implementa mediante un identificador generado (UUID, secuencia de base de datos) o mediante un atributo natural del dominio (como una matrícula o un número de pedido).

Las entidades encapsulan tanto estado como comportamiento. Un anti-patrón frecuente es el **modelo anémico**, donde las entidades son simples contenedores de datos sin lógica de negocio, y toda la lógica reside en servicios externos. DDD rechaza este enfoque: las entidades deben proteger sus invariantes y exponer métodos que expresen operaciones de negocio en términos del lenguaje ubicuo.

### 3.2 Value Objects

Un **Value Object** (Objeto de Valor) es un objeto que se define por sus atributos, no por su identidad. Dos value objects con los mismos valores de atributos se consideran iguales y son intercambiables. Esta distinción no es meramente académica: tiene implicaciones profundas en el diseño del modelo. Los value objects son **inmutables** —una vez creados, no pueden modificarse— y se comparan por igualdad estructural (todos sus atributos son iguales) en contraste con la igualdad referencial de las entidades.

La inmutabilidad de los value objects es una ventaja considerable: elimina problemas de aliasing, simplifica el razonamiento sobre el estado del sistema y permite compartir instancias sin riesgo de efectos secundarios. Cuando se necesita un value object con un valor diferente, se crea una nueva instancia en lugar de modificar la existente.

En el dominio logístico, ejemplos de value objects incluyen:
- **Direccion**: calle, ciudad, código postal, coordenadas
- **Dimensiones**: alto, ancho, profundidad
- **Peso**: valor y unidad de medida
- **VentanaTemporal**: fecha/hora de inicio y fin

La sustitución de tipos primitivos por value objects se conoce como eliminación de **Primitive Obsession** y es una de las refactorizaciones más impactantes en un modelo de dominio.

### 3.3 Servicios de Dominio

Un **Servicio de Dominio** es una operación sin estado que no pertenece naturalmente a ninguna entidad o value object del modelo. Algunas operaciones de negocio no son responsabilidad de un objeto en particular, sino que representan un proceso o una regla que involucra a múltiples objetos. En estos casos, el servicio de dominio proporciona un hogar para esa lógica, manteniendo el modelo coherente y evitando forzar responsabilidades en entidades que no las deben tener.

Los servicios de dominio se caracterizan por tres propiedades: la operación es significativa para el dominio (no es una utilidad técnica), no pertenece a ninguna entidad o value object de forma natural, y es sin estado (no mantiene estado entre invocaciones).

Es crucial distinguir entre tres tipos de servicios que coexisten en una arquitectura DDD: los **servicios de dominio** (contienen lógica de negocio pura, no dependen de infraestructura), los **servicios de aplicación** (orquestan casos de uso, coordinan transacciones y llaman a servicios de dominio) y los **servicios de infraestructura** (implementan concerns técnicos como envío de correo o acceso a bases de datos).

### 3.4 Repositorios

Un **Repositorio** proporciona la ilusión de una colección en memoria de objetos de dominio, abstrayendo los detalles de persistencia. Su propósito es doble: por un lado, desacoplar la capa de dominio de la infraestructura de persistencia, permitiendo que el modelo se centre en la lógica de negocio; por otro, proporcionar una interfaz expresiva para la recuperación de agregados que refleje el lenguaje ubicuo del dominio.

La regla fundamental de los repositorios es que solo se debe definir un repositorio por agregado. Los repositorios trabajan con raíces de agregado completas, no con entidades internas de un agregado. Esto garantiza que las fronteras de consistencia de los agregados se respeten también en la capa de persistencia.

### 3.5 Fábricas

Una **Fábrica** (Factory) encapsula la lógica de creación de objetos complejos, particularmente agregados. Cuando la creación de un agregado requiere la validación de múltiples invariantes, la composición de varias entidades y value objects, o la obtención de datos de otros agregados, delegar esta responsabilidad al constructor de la raíz de agregado puede generar un código difícil de leer y mantener. Las fábricas resuelven este problema centralizando la lógica de creación.

Las fábricas aseguran que todo objeto creado esté en un estado válido desde su nacimiento. Un agregado nunca debe existir en un estado que viole sus invariantes. Esto significa que la fábrica debe recibir todos los datos obligatorios, validar las reglas de negocio aplicables en el momento de la creación, y devolver una instancia completamente inicializada.

---

## 4. Agregados y Raíces de Agregado

### 4.1 Definición y Propósito

Un **Agregado** es un cluster de objetos de dominio tratados como una unidad de consistencia transaccional. Cada agregado tiene una **Raíz de Agregado** (Aggregate Root) —una entidad que actúa como punto de entrada y garante de las invariantes del cluster— y puede contener entidades internas y value objects que colaboran para cumplir las reglas de negocio. La frontera del agregado define qué objetos deben ser consistentes de forma atómica: dentro de la frontera, toda operación debe mantener las invariantes; fuera de ella, la consistencia se gestiona de forma eventual.

El propósito de los agregados es triple. Primero, **proteger invariantes**: la raíz de agregado es responsable de que ninguna operación deje al cluster en un estado inconsistente. Segundo, **definir unidades de consistencia transaccional**: una transacción no debe cruzar las fronteras de un agregado; si una operación requiere consistencia atómica entre múltiples agregados, el modelo debe replantearse. Tercero, **simplificar el modelo**: al establecer fronteras claras, los agregados reducen la complejidad cognitiva, permitiendo razonar sobre porciones del sistema de forma aislada.

### 4.2 Reglas de Diseño de Agregados

Vaughn Vernon, en Implementing Domain-Driven Design, formula un conjunto de reglas prácticas para el diseño de agregados que se han convertido en estándar de la comunidad DDD:

| Regla | Descripción |
|-------|-------------|
| **Proteger las invariantes** | Toda operación que afecte al agregado debe pasar por la raíz, y la raíz debe validar que las invariantes se cumplen antes y después de la operación |
| **Agregados pequeños son mejores** | Un agregado debe contener solo los objetos estrictamente necesarios para mantener sus invariantes |
| **Comparar identidades, no referencias** | Cuando un agregado necesita referirse a otro, debe almacenar la identidad (ID) del otro agregado, no una referencia directa al objeto |
| **Una transacción = un agregado** | Cada transacción de base de datos debe modificar una sola instancia de agregado |
| **No hay reglas estrictas sobre el tamaño** | El tamaño correcto depende del dominio; el criterio rector es siempre la protección de invariantes |

### 4.3 Consistencia Transaccional vs. Eventual

La distinción entre consistencia transaccional y consistencia eventual es uno de los aspectos más debatidos y malentendidos de DDD. La consistencia **transaccional** (fuerte) garantiza que un conjunto de operaciones se completa atómicamente: o todas se aplican o ninguna. La consistencia **eventual** acepta que diferentes partes del sistema pueden estar temporalmente desincronizadas, pero que convergerán a un estado consistente en un plazo definido.

Dado que una transacción no debe cruzar fronteras de agregado, las operaciones que afectan a múltiples agregados deben usar consistencia eventual. El mecanismo estándar en DDD para implementar consistencia eventual son los **eventos de dominio**: cuando un agregado completa una operación que requiere la reacción de otro agregado, publica un evento de dominio; un manejador de eventos captura el evento y ejecuta la operación en el otro agregado dentro de una nueva transacción.

La decisión entre consistencia transaccional y eventual no es binaria; es un espectro. Dentro de un agregado, se usa consistencia transaccional sin excepción. Entre agregados del mismo Bounded Context, se puede optar por consistencia eventual con eventos de dominio. Entre agregados de diferentes Bounded Contexts, la consistencia eventual es prácticamente obligatoria, mediada por eventos de integración y mecanismos de traducción como las capas anticorrosión.

---

## 5. Invariantes y Reglas de Negocio

### 5.1 Definición Formal de Invariante

Una **invariante** es una regla de negocio que debe cumplirse en todo momento para que el estado del sistema se considere válido. Formalmente, una invariante es un predicado lógico —una condición booleana— que se evalúa sobre el estado de un objeto o un conjunto de objetos y que debe ser verdadero antes y después de cada operación. Si en algún punto la invariante se evalúa a falso, el sistema se encuentra en un estado inconsistente, lo que puede derivar en errores operativos, violaciones de regulaciones o pérdidas económicas.

La distinción entre invariantes y reglas de negocio es sutil pero importante. Una regla de negocio es cualquier restricción o política que el dominio impone sobre el sistema: "los envíos internacionales requieren documentación aduanera", "un conductor no puede exceder 9 horas de conducción diaria". Una invariante es una regla de negocio que el sistema hace cumplir de forma proactiva, impidiendo que el estado la viole.

Las invariantes se clasifican según su alcance en tres categorías:
- **Invariantes de atributo**: restringen los valores permitidos de un atributo individual
- **Invariantes de entidad**: establecen relaciones entre atributos del mismo objeto
- **Invariantes de agregado**: involucran múltiples objetos dentro del mismo agregado

### 5.2 Invariantes de Agregado vs. Invariantes de Proceso

Una distinción fundamental en DDD es la que existe entre **invariantes de agregado** (locales) e **invariantes de proceso** (globales o cross-agregado). Las invariantes de agregado son aquellas que pueden protegerse completamente dentro de las fronteras de un solo agregado. La raíz de agregado tiene acceso a todo el estado necesario para evaluar la invariante y puede rechazar cualquier operación que la viole.

Las **invariantes de proceso**, en cambio, involucran el estado de múltiples agregados y, a menudo, de múltiples Bounded Contexts. Por ejemplo: "un conductor no puede estar asignado a dos vehículos simultáneamente" es una invariante que involucra al agregado Conductor y al agregado Vehiculo. Estas invariantes no pueden protegerse con una sola transacción sobre un solo agregado; requieren mecanismos de consistencia eventual, saga patterns, o procesos de compensación.

La identificación correcta de si una invariante es de agregado o de proceso tiene consecuencias arquitectónicas directas. Si se clasifica una invariante de proceso como de agregado, se tiende a crear agregados excesivamente grandes que bloquean la concurrencia. Si se clasifica una invariante de agregado como de proceso, se pierde la garantía de consistencia fuerte, introduciendo ventanas de inconsistencia que pueden ser inaceptables para el negocio.

### 5.3 Estrategias de Protección de Invariantes

La protección de invariantes es la responsabilidad primaria de la raíz de agregado, y DDD prescribe varias estrategias para implementarla de forma robusta:

1. **Encapsulamiento estricto**: La raíz de agregado no debe exponer su estado interno de forma que los clientes puedan modificarlo directamente. Todos los atributos deben ser privados y solo accesibles a través de métodos que expresen operaciones de negocio.

2. **Validación en el constructor y en cada mutación**: Las invariantes deben verificarse tanto en el momento de la creación del agregado (en el constructor o la fábrica) como en cada operación de modificación.

3. **Design by Contract (DbC)**: Las técnicas de DbC complementan la protección de invariantes al formalizar las precondiciones, postcondiciones e invariantes como parte del contrato de cada método.

4. **Domain Events para invariantes de proceso**: Para las invariantes que cruzan fronteras de agregado, la estrategia consiste en delegar la verificación a un proceso asíncrono coordinado por eventos de dominio.

5. **Specifications (Specification Pattern)**: El patrón Specification permite encapsular reglas de negocio como objetos reificables que pueden combinarse mediante operadores lógicos (AND, OR, NOT), reutilizarse en diferentes contextos y probarse de forma unitaria.

---

## 6. Eventos de Dominio

### 6.1 Definición y Mecánica

Un **Evento de Dominio** es un objeto que representa un hecho significativo ocurrido dentro del dominio, algo que ha sucedido y que otras partes del sistema necesitan conocer. Formalmente, un evento de dominio se nombra en tiempo pasado —`PedidoCreado`, `VehiculoAsignado`, `EntregaCompletada`— y contiene los datos necesarios para que los receptores comprendan qué ocurrió y puedan reaccionar adecuadamente. Los eventos de dominio son **inmutables**: representan un hecho histórico que no puede alterarse, solo compensarse con otro evento si la lógica de negocio lo requiere.

La mecánica de los eventos de dominio sigue un flujo de tres fases. En la fase de **producción**, un agregado ejecuta una operación de negocio que, como efecto secundario, genera uno o más eventos de dominio. En la fase de **publicación**, una vez que la transacción ha sido confirmada exitosamente, los eventos se extraen del agregado y se publican a través de un mecanismo de distribución. En la fase de **consumo**, uno o más manejadores de eventos reciben el evento y ejecutan la lógica de reacción correspondiente.

Es importante distinguir entre **eventos de dominio** (internos a un Bounded Context) y **eventos de integración** (cruzan fronteras de contexto). Los eventos de dominio son internos: se publican y consumen dentro del mismo contexto, y su estructura puede evolucionar libremente. Los eventos de integración cruzan fronteras: se publican en un contexto y se consumen en otro, por lo que su estructura debe ser estable, versionada y potencialmente traducida por las capas anticorrosión.

### 6.2 Eventos de Integración entre Contextos

Cuando dos Bounded Contexts necesitan coordinarse, los eventos de integración proporcionan un mecanismo de acoplamiento débil que preserva la autonomía de cada contexto. A diferencia de la invocación síncrona (REST, gRPC), donde el contexto consumidor depende directamente de la disponibilidad y el contrato del contexto productor, la comunicación basada en eventos permite que el productor publique un hecho sin conocer quién ni cuántos lo consumirán.

El diseño de eventos de integración requiere atención a varios aspectos. Primero, la **granularidad**: un evento demasiado fino genera un volumen excesivo y obliga a los consumidores a recomponer el estado; un evento demasiado grueso pierde información sobre la naturaleza del cambio. Segundo, el **versionado**: cuando el esquema de un evento evoluciona, los consumidores existentes deben seguir funcionando. Tercero, la **idempotencia**: los eventos de integración pueden entregarse más de una vez debido a reintentos en la infraestructura de mensajería.

### 6.3 Event Sourcing como Extensión

**Event Sourcing** es un patrón de persistencia que, aunque no es exclusivo de DDD, complementa naturalmente el modelo de eventos de dominio. En la persistencia tradicional, el estado actual de un agregado se almacena como un snapshot. En Event Sourcing, en cambio, el estado de un agregado se reconstruye a partir de la secuencia completa de eventos de dominio que le han afectado.

Las ventajas de Event Sourcing son significativas en dominios con requisitos de auditoría, como la logística. Primero, proporciona un **audit trail completo y natural**: cada cambio está registrado como un evento inmutable con marca temporal. Segundo, facilita el **debugging temporal**: cuando se detecta un bug, se puede reproducir la secuencia de eventos que condujo al estado erróneo. Tercero, habilita **proyecciones múltiples**: los mismos eventos pueden alimentar diferentes vistas optimizadas para consultas específicas.

Sin embargo, Event Sourcing introduce complejidad operacional considerable. La reconstrucción del estado puede ser lenta para agregados con historiales largos, lo que requiere mecanismos de snapshotting periódico. El versionado de eventos es más crítico porque los eventos antiguos deben poder interpretarse con el código actual. La consistencia eventual es inherente: las proyecciones se actualizan de forma asíncrona respecto a la escritura de eventos.

---

## 7. Aplicación a Flota de Logística: Diseño Estratégico

### 7.1 Identificación de Bounded Contexts

El dominio de una flota de logística es lo suficientemente complejo como para que un modelo unificado resulte inmanejable. Aplicando los criterios organizacional, lingüístico y operacional, se identifican los siguientes Bounded Contexts:

| Contexto | Descripción | Equipo Responsable |
|----------|-------------|-------------------|
| **Gestión de Flota** | Gestiona los vehículos: estado operativo, mantenimiento, ubicación | Operaciones de flota |
| **Asignación de Rutas** | Planifica, optimiza y supervisa las rutas de entrega | Planificación logística |
| **Gestión de Pedidos** | Administra el ciclo de vida de los pedidos de clientes | Comercial |
| **Recursos Humanos** | Gestiona los conductores, licencias, horarios | RRHH operativos |
| **Facturación** | Calcula y gestiona los cargos asociados a los servicios | Financiero |

Nótese cómo el mismo concepto —por ejemplo, "vehículo"— adquiere matices diferentes en cada contexto. En Gestión de Flota, un vehículo es un activo con mantenimiento; en Asignación de Rutas, es una unidad de capacidad y ubicación; en Facturación, es un centro de costo. Esta polisemia es precisamente lo que justifica la separación en Bounded Contexts.

### 7.2 Mapa de Contextos

Las relaciones entre los contextos identificados se organizan del siguiente modo:

- **Gestión de Pedidos → Asignación de Rutas** (Customer-Supplier): Pedidos es el cliente: solicita que las rutas cubran los pedidos generados
- **Asignación de Rutas → Gestión de Flota** (Customer-Supplier): Asignación de Rutas solicita vehículos disponibles a Gestión de Flota
- **Asignación de Rutas → Recursos Humanos** (Customer-Supplier): Asignación de Rutas necesita conductores disponibles y con licencia vigente
- **Gestión de Pedidos → Facturación** (Open Host Service / Published Language): Facturación expone un servicio estandarizado que consume eventos de Pedidos
- **Gestión de Flota → Facturación** (Conformist): Facturación consume datos de costos de flota en el formato que proporciona
- **Cualquier contexto externo → Bounded Context existente** (Anti-Corruption Layer): Para integrar con sistemas legacy o externos

### 7.3 Lenguaje Ubicuo por Contexto

Cada Bounded Context desarrolla su propio lenguaje ubicuo, coherente internamente pero potencialmente divergente entre contextos:

- **Gestión de Flota**: Vehiculo, EstadoOperativo (Disponible, EnRuta, EnMantenimiento, FueraDeServicio), MantenimientoProgramado, KilometrajeActual, CapacidadDeCarga
- **Asignación de Rutas**: Ruta, Parada, Segmento, PlanDeRuta, Optimización, EstadoDeRuta
- **Gestión de Pedidos**: Pedido, LíneaDePedido, EstadoDelPedido (Registrado, Confirmado, EnTrnsito, Entregado, Cancelado), SLA, Incidencia
- **Recursos Humanos**: Conductor, Licencia, JornadaLaboral, Asignación, RestricciónReglamentaria
- **Facturación**: Cargo, Tarifa, Factura, Ajuste, CentroDeCosto

El mantenimiento disciplinado de estos vocabularios —en el código, en la documentación y en las conversaciones del equipo— es lo que convierte al lenguaje ubicuo de una aspiración teórica en una herramienta operativa que reduce ambigüedades y acelera el desarrollo.

---

## 8. Aplicación a Flota de Logística: Diseño Táctico

### 8.1 Agregados Principales

El modelado táctico de la flota logística se articula en torno a cuatro agregados principales:

#### Agregado Vehículo (Gestión de Flota)

La raíz es la entidad `Vehiculo`, identificada por `VehiculoId`. Contiene las entidades internas `MantenimientoProgramado` (cada intervención de mantenimiento planificada) y `RegistroDeUbicacion` (historial de posiciones GPS). Los value objects incluyen `Matricula`, `CapacidadDeCarga` (peso máximo y volumen), `EstadoOperativo` (enum: Disponible, EnRuta, EnMantenimiento, FueraDeServicio), `Kilometraje` y `TipoDeVehiculo`.

```typescript
class Vehiculo {
  private readonly id: VehiculoId;
  private matricula: Matricula;
  private estadoOperativo: EstadoOperativo;
  private capacidad: CapacidadDeCarga;
  private kilometraje: Kilometraje;
  private readonly mantenimientos: MantenimientoProgramado[];
  private eventosDominio: EventoDominio[] = [];

  asignarARuta(): void {
    if (this.estadoOperativo !== EstadoOperativo.Disponible) {
      throw new Error('Solo los vehículos disponibles pueden asignarse a una ruta');
    }
    this.estadoOperativo = EstadoOperativo.EnRuta;
    this.eventosDominio.push(new VehiculoAsignado(this.id));
  }

  registrarMantenimiento(mantenimiento: MantenimientoProgramado): void {
    if (this.estadoOperativo === EstadoOperativo.EnRuta) {
      throw new Error('No se puede programar mantenimiento a un vehículo en ruta');
    }
    this.mantenimientos.push(mantenimiento);
    this.estadoOperativo = EstadoOperativo.EnMantenimiento;
  }

  completarMantenimiento(mantenimientoId: MantenimientoId, kilometrajeActual: Kilometraje): void {
    const mantenimiento = this.mantenimientos.find(m => m.id.equals(mantenimientoId));
    if (!mantenimiento) throw new Error('Mantenimiento no encontrado');
    mantenimiento.completar();
    this.kilometraje = kilometrajeActual;
    this.estadoOperativo = EstadoOperativo.Disponible;
    this.eventosDominio.push(new MantenimientoCompletado(this.id, kilometrajeActual));
  }
}
```

#### Agregado Ruta (Asignación de Rutas)

La raíz es la entidad `Ruta`, identificada por `RutaId`. Contiene las entidades internas `Parada` (cada punto de carga o descarga) y `Segmento` (tramo entre paradas consecutivas). Los value objects incluyen `VentanaTemporal`, `Direccion`, `Distancia`, `TiempoEstimado`, `EstadoDeRuta` (Planificada, EnProgreso, Completada, Cancelada) y las referencias `VehiculoId` y `ConductorId` (identidades, no referencias directas).

```typescript
class Ruta {
  private readonly id: RutaId;
  private estado: EstadoDeRuta;
  private vehiculoId: VehiculoId | null;
  private conductorId: ConductorId | null;
  private readonly paradas: Parada[];
  private eventosDominio: EventoDominio[] = [];

  iniciar(): void {
    if (this.estado !== EstadoDeRuta.Planificada) {
      throw new Error('Solo las rutas planificadas pueden iniciarse');
    }
    if (!this.vehiculoId || !this.conductorId) {
      throw new Error('La ruta debe tener vehículo y conductor asignados');
    }
    this.validarOrdenDeParadas();
    this.estado = EstadoDeRuta.EnProgreso;
    this.eventosDominio.push(new RutaIniciada(this.id, this.vehiculoId, this.conductorId));
  }

  completarParada(paradaId: ParadaId, horaLlegada: Date): void {
    if (this.estado !== EstadoDeRuta.EnProgreso) {
      throw new Error('Solo se pueden completar paradas en rutas en progreso');
    }
    const parada = this.paradas.find(p => p.id.equals(paradaId));
    if (!parada) throw new Error('Parada no encontrada en esta ruta');
    parada.completar(horaLlegada);
    if (this.paradas.every(p => p.estaCompletada())) {
      this.estado = EstadoDeRuta.Completada;
      this.eventosDominio.push(new RutaCompletada(this.id));
    }
  }

  private validarOrdenDeParadas(): void {
    for (let i = 1; i < this.paradas.length; i++) {
      if (this.paradas[i].ventana.inicio < this.paradas[i - 1].ventana.fin) {
        throw new Error('Las ventanas temporales de las paradas se solapan');
      }
    }
  }
}
```

#### Agregado Pedido (Gestión de Pedidos)

La raíz es la entidad `Pedido`, identificada por `PedidoId`. Contiene las entidades internas `LineaDePedido` e `Incidencia`. Los value objects incluyen `DireccionDeEntrega`, `DireccionDeRecogida`, `VentanaTemporal`, `EstadoDelPedido` (Registrado, Confirmado, EnTrnsito, Entregado, Cancelado), `Dimensiones`, `Peso`, `SLA` y la referencia `RutaId`.

#### Agregado Conductor (Recursos Humanos)

La raíz es la entidad `Conductor`, identificada por `ConductorId`. Contiene las entidades internas `Licencia` y `RegistroDeJornada`. Los value objects incluyen `NombreCompleto`, `EstadoDelConductor` (Disponible, EnRuta, DeDescanso, DeBaja), `HorasDeConduccionDiarias`, `RestriccionReglamentaria` (límites legales de conducción).

### 8.2 Entidades y Value Objects del Dominio

Los value objects más significativos del dominio logístico incluyen:

- **CapacidadDeCarga**: Encapsula pesoMaximo: Kilogramos y volumenUtil: MetrosCubicos. Implementa la operación `puedeTransportar(peso, volumen): boolean`.

- **VentanaTemporal**: Encapsula inicio: Date y fin: Date. Implementa operaciones como `solapaCon(otra): boolean`, `contiene(fecha): boolean` y `duracion(): Horas`.

- **Kilometraje**: Encapsula valor: number y unidad: UnidadDeDistancia. Implementa la operación `sumar(otro): Kilometraje` y la validación de que el valor no puede ser negativo.

- **Matricula**: Encapsula el valor de la matrícula como string y valida el formato según la jurisdicción aplicable.

### 8.3 Invariantes de Negocio en la Flota

**Invariantes del agregado Vehículo:**
- Un vehículo en estado EnMantenimiento o FueraDeServicio no puede ser asignado a una ruta
- Un vehículo en estado EnRuta no puede entrar en mantenimiento
- El kilometraje solo puede incrementarse, nunca decrementarse
- Un mantenimiento completado debe tener registrada la fecha de finalización y el kilometraje al completarlo
- Un vehículo no puede tener dos mantenimientos programados en ventanas temporales solapadas

**Invariantes del agregado Ruta:**
- Las paradas deben estar ordenadas temporalmente sin solapamientos
- Una ruta solo puede iniciarse si tiene vehículo y conductor asignados
- Una ruta solo puede transicionar a Completada cuando todas sus paradas están completadas
- Una ruta cancelada no puede reanudarse; debe crearse una nueva ruta
- La distancia total de la ruta debe ser consistente con la suma de las distancias de sus segmentos

**Invariantes del agregado Pedido:**
- Un pedido no puede transicionar de Entregado a ningún otro estado
- Un pedido en estado EnTrnsito debe tener una RutaId asignada
- No se pueden añadir líneas a un pedido en estado Confirmado o posterior
- La dirección de entrega debe ser válida antes de confirmar el pedido
- Un pedido cancelado después de estar EnTrnsito genera una incidencia automáticamente

**Invariantes del agregado Conductor:**
- Las horas de conducción diaria no pueden exceder el límite legal (9 horas en la UE, con extensiones reglamentadas)
- Un conductor con licencia vencida no puede ser asignado a rutas
- Un conductor en estado DeDescanso no puede ser asignado a una ruta hasta que cumpla su período de descanso reglamentario
- Un conductor no puede estar asignado a dos rutas simultáneamente (invariante de proceso, verificada eventualmente)

### 8.4 Eventos de Dominio en la Flota

Los eventos de dominio son el mecanismo de coordinación entre los agregados y contextos de la flota:

**Eventos intra-contexto (dentro de Asignación de Rutas):**

| Evento | Origen | Consumidor | Reacción |
|--------|--------|------------|----------|
| RutaIniciada | Agregado Ruta | ServicioDeTracking | Inicia el seguimiento en tiempo real |
| ParadaCompletada | Agregado Ruta | ServicioDeNotificaciones | Notifica al cliente |
| RutaCompletada | Agregado Ruta | ServicioDePlanificación | Libera los recursos |

**Eventos de integración (entre contextos):**

| Evento | Contexto Origen | Contexto Destino | Reacción |
|--------|-----------------|-------------------|----------|
| PedidoConfirmado | Gestión de Pedidos | Asignación de Rutas | Incluye el pedido en la planificación |
| VehiculoDisponible | Gestión de Flota | Asignación de Rutas | Actualiza el pool de vehículos |
| ConductorDisponible | Recursos Humanos | Asignación de Rutas | Actualiza el pool de conductores |
| PedidoEntregado | Gestión de Pedidos | Facturación | Genera el cargo por servicio |
| RutaCompletada | Asignación de Rutas | Facturación | Calcula costos de la ruta |
| MantenimientoProgramado | Gestión de Flota | Asignación de Rutas | Retira el vehículo del pool |

El flujo de eventos más representativo del dominio logístico es el ciclo de vida completo de un envío: el cliente registra un pedido (PedidoRegistrado), el operador confirma (PedidoConfirmado), se planifica la ruta y se asignan vehículo y conductor, la ruta se inicia (RutaIniciada), cada parada se completa, la ruta se completa (RutaCompletada), y finalmente se genera elcargo hacia Facturación.

---

## 9. Consideraciones de Implementación

### 9.1 Estructura de Capas

La implementación de un sistema DDD se organiza típicamente en cuatro capas con responsabilidades bien delimitadas:

| Capa | Contiene | Conoce a |
|------|----------|----------|
| **Dominio** | Entidades, value objects, agregados, eventos, servicios de dominio, interfaces de repositorio | Nada |
| **Aplicación** | Servicios de aplicación, casos de uso, orquestación | Dominio |
| **Infraestructura** | Repositorios concretos, publicadores de eventos, adaptadores | Dominio (interfaces) |
| **Presentación** | Controladores REST, consumidores de mensajes | Aplicación |

Estructura de directorios recomendada:

```
com.logistica.rutas/
├── domain/
│   ├── model/
│   │   ├── Ruta.java
│   │   ├── Parada.java
│   │   └── evento/
│   ├── service/
│   └── repository/
├── application/
│   ├── service/
│   └── event/
├── infrastructure/
│   ├── persistence/
│   └── messaging/
└── presentation/
    └── rest/
```

### 9.2 Testing de Invariantes y Agregados

El testing es el guardián de las invariantes del modelo y debe ser una prioridad de primer orden en la implementación de DDD. La estrategia de testing se organiza en tres niveles:

1. **Tests unitarios de agregados** (70%): Son los tests más importantes porque validan directamente que las invariantes se protegen correctamente. Cada agregado debe tener un conjunto de tests que verifique: que las operaciones válidas producen el estado esperado, que las operaciones inválidas son rechazadas con excepciones descriptivas, y que los eventos de dominio correctos se generan.

2. **Tests de integración de repositorios** (20%): Verifican que la persistencia y recuperación de agregados funciona correctamente contra una base de datos real.

3. **Tests de aceptación de casos de uso** (10%): Validan que los flujos de negocio completos producen los resultados esperados de extremo a extremo.

### 9.3 Anti-patrones Comunes

Los anti-patrones más frecuentes y perjudiciales son:

- **Modelo Anémico**: Las entidades y agregados son simples contenedores de datos con getters y setters, y toda la lógica de negocio reside en servicios externos. Esto rompe el principio fundamental de DDD.

- **Agregados Gigantes**: Diseñar agregados que agrupan demasiadas entidades y value objects en una sola frontera de consistencia. Los síntomas incluyen bloqueos frecuentes en la base de datos y dificultades para escalar la concurrencia.

- **Ignorar el Contexto**: Implementar patrones tácticos sin haber definido previamente los Bounded Contexts y el mapa de contextos. Esto lleva a un modelo donde los límites de los agregados son arbitrarios.

- **Repositorios por Entidad**: Crear un repositorio por cada entidad en lugar de uno por raíz de agregado. Esto permite que las entidades internas sean accedidas y modificadas directamente, eludiendo la protección de invariantes.

- **Eventos de Dominio como Notificaciones Genéricas**: Utilizar eventos de dominio como un mecanismo genérico de notificación sin respetar las reglas de publicación transaccional ni garantizar la idempotencia de los consumidores.

---

## 10. Conclusión y Referencias

### 10.1 Síntesis de Lecciones Aprendidas

Domain-Driven Design proporciona un marco conceptual poderoso para abordar la complejidad de dominios como la gestión de flotas logísticas. Las lecciones clave incluyen:

1. **El diseño estratégico precede al táctico**: antes de implementar entidades y agregados, es fundamental definir los Bounded Contexts, el lenguaje ubicuo y el mapa de contextos.

2. **Los agregados son las unidades de consistencia**: definir fronteras claras entre agregados permite proteger las invariantes locales mientras se acepta la consistencia eventual entre ellos.

3. **El lenguaje ubicuo es el pegamento**: mantener consistencia entre el lenguaje del negocio y el código reduce la deuda de traducción y acelera el desarrollo.

4. **Los eventos de dominio habilitan la coordinación**: permiten desacoplar agregados y contextos mientras se mantiene la coherencia global del sistema.

5. **Las invariantes determinan el diseño**: la clasificación correcta de invariantes como locales o de proceso tiene consecuencias arquitectónicas directas.

6. **El testing protege las invariantes**: cada agregado debe tener tests unitarios que validen que las invariantes se protegen correctamente.

### 10.2 Referencias Bibliográficas

- Evans, E. (2003). *Domain-Driven Design: Tackling Complexity in the Heart of Software*. Addison-Wesley.
- Vernon, V. (2013). *Implementing Domain-Driven Design*. Addison-Wesley.
- Vernon, V. (2016). *Domain-Driven Design Distilled*. Addison-Wesley.
- Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
- Meyer, B. (1997). *Object-Oriented Software Construction*. Prentice Hall.