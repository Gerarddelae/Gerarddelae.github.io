---
title: 'Patrones de Diseño GoF en C# — Guía Práctica Completa'
slug: 'patrones-diseno-gof-csharp'
description: 'Una referencia exhaustiva de los 23 patrones de diseño GoF con ejemplos prácticos en C# 12: creacionales, estructurales y de comportamiento'
coverImage: ./blog-placeholder-4.png
tags: ["Patrones de Diseño", "GoF", "C#", "Arquitectura de Software", "SOLID"]
pubDate: '2026-05-02'
---

Los patrones de diseño son soluciones probadas y reutilizables a problemas recurrentes en el desarrollo de software. A diferencia de un algoritmo que se copia y pega directamente, un patrón de diseño describe una solución general que puede adaptarse a múltiples contextos. Proporcionan un vocabulario compartido entre desarrolladores, facilitan la comunicación en equipos y promueven la creación de arquitecturas más mantenibles y escalables.

El término GoF (Gang of Four) hace referencia a los cuatro autores que publicaron en 1994 el libro seminal *Design Patterns: Elements of Reusable Object-Oriented Software*: Erich Gamma, Richard Helm, Ralph Johnson y John Vlissides. Esta obra catalogó 23 patrones de diseño fundamentales organizados en tres categorías: creacionales, estructurales y de comportamiento.

---

## 1. Patrones Creacionales

Los patrones creacionales abstraen el proceso de instanciación de objetos. Su propósito central es desacoplar el código cliente de las clases concretas que necesita crear, proporcionando mecanismos que hacen que el sistema sea más flexible frente a cambios en la estructura o el tipo de objetos que utiliza.

### 1.1 Singleton

**Definición:** Garantiza que una clase tenga una única instancia y proporciona un punto de acceso global a ella.

El patrón Singleton es útil cuando un recurso compartido debe ser accesible desde múltiples puntos sin riesgo de crear instancias duplicadas.

```csharp
public sealed class AppConfiguration {
    private static readonly Lazy<AppConfiguration> _instance = 
        new(() => new AppConfiguration());
    
    public static AppConfiguration Instance => _instance.Value;
    
    public string ApiBaseUrl { get; private set; }
    
    private AppConfiguration() {
        ApiBaseUrl = "https://api.myapp.com/v2";
    }
}

// Uso:
var config = AppConfiguration.Instance;
```

**Cuándo aplicar:** Necesitas un punto de acceso global controlado a un recurso compartido (logger, caché, configuración) o el costo de crear una nueva instancia es innecesariamente alto. En proyectos ASP.NET Core modernos, es preferible usar inyección de dependencias con lifetime Singleton.

### 1.2 Factory Method

**Definición:** Define una interfaz para crear un objeto, pero permite a las subclases decidir qué clase concreta instanciar.

```csharp
public abstract class Notificacion {
    public abstract void Enviar();
}

public class EmailNotificacion : Notificacion {
    public override void Enviar() => Console.WriteLine("[EMAIL] Enviado");
}

public abstract class NotificacionFactory {
    public abstract Notificacion CrearNotificacion();
    
    public void Notificar() {
        var notif = CrearNotificacion();
        notif.Enviar();
    }
}
```

**Cuándo aplicar:** Cuando no sabes de antemano qué clases concretas necesitará el sistema, o cuando quieres que una clase delegue la creación a sus subclases permitiendo extensibilidad sin modificar código existente.

### 1.3 Abstract Factory

**Definición:** Proporciona una interfaz para crear familias de objetos relacionados o dependientes sin especificar sus clases concretas.

```csharp
public interface IUIFactory {
    IBoton CrearBoton();
    ITextBox CrearTextBox();
}

public class WindowsUIFactory : IUIFactory {
    public IBoton CrearBoton() => new WindowsBoton();
    public ITextBox CrearTextBox() => new WindowsTextBox();
}

public class FormularioRegistro {
    public FormularioRegistro(IUIFactory factory) {
        _boton = factory.CrearBoton();
    }
}
```

**Cuándo aplicar:** Cuando el sistema necesita crear familias de objetos relacionados que deben funcionar juntos y quieres garantizar que los productos creados sean compatibles entre sí.

### 1.4 Builder

**Definición:** Separa la construcción de un objeto complejo de su representación, permitiendo crear diferentes representaciones con el mismo proceso.

```csharp
public class ReporteBuilder : IReporteBuilder {
    private readonly Reporte _reporte = new();
    
    public IReporteBuilder DefinirTitulo(string t) {
        _reporte.Titulo = t; 
        return this;
    }
    
    public IReporteBuilder AgregarSeccion(string s) {
        _reporte.Secciones.Add(s); 
        return this;
    }
    
    public Reporte Build() => _reporte;
}

// Uso con Fluent API:
var reporte = new ReporteBuilder()
    .DefinirTitulo("Ventas Q1")
    .AgregarSeccion("Resumen")
    .Build();
```

**Cuándo aplicar:** Cuando un objeto tiene muchos parámetros opcionales, cuando la creación requiere pasos secuenciales donde el orden importa, o cuando necesitas crear variantes del mismo objeto complejo.

### 1.5 Prototype

**Definición:** Especifica los tipos de objetos a crear mediante la clonación de un prototipo existente.

```csharp
public interface IPrototype<T> { T Clonar(); }

public class ConfigProducto : IPrototype<ConfigProducto> {
    public string Nombre { get; set; }
    public decimal Precio { get; set; }
    
    public ConfigProducto Clonar() => new(Nombre, Precio);
}

var catalogo = new CatalogoPrototipos();
catalogo.Registrar("camiseta", new ConfigProducto("Camiseta", 45000));
var copia = catalogo.Clonar("camiseta");
```

**Cuándo aplicar:** Cuando crear un objeto desde cero es costoso (BD, APIs) y es más eficiente copiar uno existente, o cuando necesitas crear múltiples variaciones de un objeto base.

---

## 2. Patrones Estructurales

Los patrones estructurales abordan el problema de cómo componer clases y objetos para formar estructuras más grandes y flexibles.

### 2.1 Adapter

**Definición:** Convierte la interfaz de una clase en otra interfaz que los clientes esperan.

```csharp
public class LegacyPaymentAdapter : IProcesadorPagos {
    private readonly LegacyPaymentGateway _gateway = new();
    
    public bool ProcesarPago(string orderId, decimal monto) {
        var txCode = _gateway.MakeTransaction("MCH-0042", orderId, 
            (double)monto, "COP");
        return txCode > 0;
    }
}
```

**Cuándo aplicar:** Cuando necesitas integrar una clase o API de terceros cuya interfaz no coincide con la esperada, o durante migraciones de sistemas legacy.

### 2.2 Bridge

**Definición:** Desacopla una abstracción de su implementación, permitiendo que ambas varíen independientemente.

```csharp
public abstract class Forma {
    protected readonly IRenderizador _renderizador;
    protected Forma(IRenderizador r) => _renderizador = r;
    public abstract void Dibujar();
}

// Combinar independientemente:
var circulo = new Circulo(50, new RenderizadorOpenGL());
var circuloSVG = new Circulo(50, new RenderizadorSVG());
```

**Cuándo aplicar:** Cuando tienes dos o más dimensiones de variación independientes, o cuando la herencia genera una explosión combinatoria de subclases.

### 2.3 Composite

**Definición:** Compone objetos en estructuras de árbol para representar jerarquías parte-todo.

```csharp
public abstract class NodoSistemaArchivos {
    public string Nombre { get; }
    public abstract void Mostrar(string indent);
    public virtual void Agregar(NodoSistemaArchivos n) 
        => throw new NotSupportedException();
}

public class Directorio : NodoSistemaArchivos {
    private readonly List<NodoSistemaArchivos> _hijos = new();
    public override void Agregar(NodoSistemaArchivos n) => _hijos.Add(n);
}
```

**Cuándo aplicar:** Cuando el modelo de datos forma una jerarquía natural (archivos/directorios, organigrama), o cuando necesitas tratar uniformemente objetos individuales y grupos.

### 2.4 Decorator

**Definición:** Agrega responsabilidades adicionales a un objeto de forma dinámica, sin modificar la clase original.

```csharp
public abstract class ProcesadorDecorador : IProcesadorPedido {
    protected readonly IProcesadorPedido _inner;
    
    public override Pedido Procesar(Pedido p) {
        return _inner.Procesar(p);
    }
}

public class CalculadorImpuestosDecorator : ProcesadorDecorador {
    public override Pedido Procesar(Pedido p) {
        p = base.Procesar(p);
        p.Impuesto = p.Subtotal * 0.19m; 
        return p;
    }
}
```

**Cuándo aplicar:** Cuando necesitas agregar funcionalidad de forma dinámica y combinable (pipeline de validaciones), o cuando la herencia no es viable por el número de combinaciones.

### 2.5 Facade

**Definición:** Proporciona una interfaz unificada para acceder a un subsistema complejo.

```csharp
public class ServicioEnviosFacade {
    private readonly CalculadorRutas _rutas = new();
    private readonly CalculadorCostos _costos = new();
    private readonly GestorInventario _inv = new();
    
    public (string Guia, decimal Tarifa) CrearEnvio(...) {
        var ruta = _rutas.CalcularRutaOptima(origen, destino, peso);
        var tarifa = _costos.CalcularTarifa(ruta, peso, valor);
        _inv.ReservarEmpaque(tipoPaque, cantidad);
        return (GenerarGuia(ruta, tarifa), tarifa);
    }
}
```

**Cuándo aplicar:** Cuando un subsistema tiene múltiples clases con APIs complejas, o cuando quieres desacoplar el código cliente de la implementación interna.

### 2.6 Flyweight

**Definición:** Comparte eficientemente objetos que se usan repetidamente, minimizando el consumo de memoria.

```csharp
public class FabricaCaracteres {
    private readonly Dictionary<string, ICaracterEstilo> _pool = new();
    
    public ICaracterEstilo Obtener(char s, string font, int sz) {
        var key = $"{s}|{font}|{sz}";
        if (!_pool.ContainsKey(key))
            _pool[key] = new CaracterEstilo(s, font, sz);
        return _pool[key];
    }
}
```

**Cuándo aplicar:** Cuando la aplicación maneja un gran número de objetos cuyo estado se repite frecuentemente, o cuando el consumo de memoria es crítico.

### 2.7 Proxy

**Definición:** Proporciona un sustituto o representante de otro objeto para controlar el acceso.

```csharp
public class ImagenProxy : IImagen {
    private ImagenReal? _real;
    
    public void Mostrar() {
        if (_real == null) {
            _real = new ImagenReal(_nombre);
        }
        _real.Mostrar();
    }
}
```

**Cuándo aplicar:** Cuando la creación de un objeto es costosa y quieres diferirla (proxy virtual), necesitas controlar el acceso (proxy de protección), o el objeto está en un contexto remoto.

---

## 3. Patrones de Comportamiento

Los patrones de comportamiento se centran en la asignación de responsabilidades entre objetos y en la comunicación entre ellos.

### 3.1 Chain of Responsibility

**Definición:** Permite encadenar múltiples receptores donde cada uno decide si procesa la solicitud o la pasa al siguiente.

```csharp
public abstract class AprobadorHandler {
    private AprobadorHandler? _next;
    
    public AprobadorHandler SetSiguiente(AprobadorHandler h) {
        _next = h; 
        return h;
    }
    
    public abstract void Aprobar(SolicitudAprobacion s);
    
    protected void PasarAlSiguiente(SolicitudAprobacion s) 
        => _next?.Aprobar(s);
}

// Uso: supervisor.SetSiguiente(gerente).SetSiguiente(director);
```

**Cuándo aplicar:** Cuando una solicitud debe pasar por múltiples procesadores en secuencia, o cuando quién procesa depende de condiciones en runtime. Ejemplo real: el pipeline de middleware de ASP.NET Core.

### 3.2 Command

**Definición:** Encapsula una solicitud como un objeto, permitiendo parametrizar, encolar y soportar deshacer.

```csharp
public interface IComando { 
    void Ejecutar(); 
    void Deshacer(); 
}

public class ComandoEscribir : IComando {
    private readonly EditorTexto _editor; 
    private readonly string _texto;
    
    public void Ejecutar() => _editor.Escribir(_texto);
    public void Deshacer() => _editor.Deshacer();
}

public class BarraHerramientas {
    private readonly Stack<IComando> _historial = new();
    public void EjecutarComando(IComando c) { 
        c.Ejecutar(); 
        _historial.Push(c); 
    }
}
```

**Cuándo aplicar:** Cuando necesitas encapsular acciones para deshacer, encolar o parametrizar. Ejemplo real: IRequest de MediatR.

### 3.3 Interpreter

**Definición:** Define una representación para la gramática de un lenguaje junto con un intérprete.

```csharp
public abstract class ExpresionFiltro {
    public abstract bool Evaluar(Producto p);
}

public class FiltroAND : ExpresionFiltro {
    private readonly ExpresionFiltro _izq, _der;
    
    public override bool Evaluar(Producto p)
        => _izq.Evaluar(p) && _der.Evaluar(p);
}
```

**Cuándo aplicar:** Cuando necesitas interpretar un lenguaje o DSL simple, o cuando la gramática es relativamente sencilla.

### 3.4 Iterator

**Definición:** Proporciona una forma de acceder secuencialmente a los elementos de una colección sin exponer su representación subyacente.

```csharp
public class IteradorDFS<T> : IEnumerator<T> {
    private readonly Stack<NodoArbol<T>> _pila = new();
    
    public bool MoveNext() {
        if (_pila.Count == 0) return false;
        var nodo = _pila.Pop();
        _actual = nodo.Valor;
        for (int i = nodo.Hijos.Count-1; i >= 0; i--) 
            _pila.Push(nodo.Hijos[i]);
        return true;
    }
}
```

**Cuándo aplicar:** Cuando quieres proporcionar múltiples formas de recorrido sin exponer la estructura interna. C# ya implementa este patrón con IEnumerable<T>/IEnumerator<T>.

### 3.5 Mediator

**Definición:** Define un objeto centralizado que coordina la comunicación entre un conjunto de objetos.

```csharp
public class FormularioRegistroMediator : IFormularioMediator {
    public void Notificar(object comp, string evento) {
        if (comp == _checkDesc) {
            _campoDesc.Habilitar(_checkDesc.Marcado);
        }
        _boton.SetHabilitado(_emailValido && _checkTerminos.Marcado);
    }
}
```

**Cuándo aplicar:** Cuando múltiples componentes se comunican de forma directa y compleja. Ejemplo real: MediatR para desacoplar controladores de handlers.

### 3.6 Memento

**Definición:** Captura y externaliza el estado interno de un objeto sin violar la encapsulación.

```csharp
public class WorkflowPedido {
    public WorkflowMemento CrearCheckpoint(string desc)
        => new(JsonSerializer.Serialize(new { Etapa, Datos }), desc);
    
    public void Restaurar(WorkflowMemento m) {
        var state = JsonSerializer.Deserialize<...>(m.EstadoJson);
        Etapa = state.Etapa;
    }
}
```

**Cuándo aplicar:** Cuando necesitas checkpoint/rollback con estado complejo. Diferencia con Command: Memento almacena estados, Command almacena acciones.

### 3.7 Observer

**Definición:** Define una dependencia de uno a muchos donde cuando un objeto cambia, todos sus dependientes son notificados.

```csharp
public class BolsaDeValores {
    private readonly List<IObservadorBolsa> _observers = new();
    
    public void Suscribir(IObservadorBolsa o) => _observers.Add(o);
    
    public void ActualizarPrecio(string sym, decimal precio) {
        _precios[sym] = precio;
        foreach (var o in _observers) 
            o.Actualizar(sym, prev, precio);
    }
}
```

**Cuándo aplicar:** Cuando un cambio debe notificar automáticamente a otros objetos, o cuando el conjunto de suscriptores cambia dinámicamente. C# implementa esto con delegates y el patrón INotifyPropertyChanged.

### 3.8 State

**Definición:** Permite que un objeto altere su comportamiento cuando su estado interno cambia.

```csharp
public abstract class EstadoPedido {
    public abstract string Nombre { get; }
    public virtual void Pagar(Pedido ctx) 
        => throw new InvalidOperationException();
}

public class EstadoNuevo : EstadoPedido {
    public override string Nombre => "Nuevo";
    public override void Pagar(Pedido ctx) 
        => ctx.TransicionarA(new EstadoPagado());
}
```

**Cuándo aplicar:** Cuando el comportamiento depende de un campo de estado que cambia frecuentemente, o cuando tienes bloques switch/if grandes basados en estados.

### 3.9 Strategy

**Definición:** Define una familia de algoritmos, encapsula cada uno y los hace intercambiables.

```csharp
public interface IEstrategiaDescuento {
    decimal CalcularDescuento(decimal subtotal);
}

public class DescuentoPorcentaje : IEstrategiaDescuento {
    private readonly decimal _pct;
    public decimal CalcularDescuento(decimal s) => s * (_pct / 100);
}

var carrito = new CarritoCompras(new DescuentoPorcentaje(10));
carrito.CambiarEstrategia(new DescuentoCategoriaEspecial());
```

**Cuándo aplicar:** Cuando tienes múltiples variantes de un algoritmo intercambiables en runtime. Ejemplo real: IComparer<T>.

### 3.10 Template Method

**Definición:** Define el esqueleto de un algoritmo, delegando algunos pasos a las subclases.

```csharp
public abstract class ProcesadorDatos {
    public sealed void Procesar(string ruta) {
        var datos = LeerDatos(ruta);
        if (!ValidarDatos(datos)) return;
        var transformados = Transformar(datos);
        ExportarResultado(Calcular(transformados));
    }
    
    protected abstract bool ValidarDatos(List<string> d);
    protected abstract List<decimal> Transformar(List<string> d);
}
```

**Cuándo aplicar:** Cuando múltiples clases comparten el esqueleto de un algoritmo pero difieren en pasos específicos. Ejemplo real: OnModelCreating en EF Core.

### 3.11 Visitor

**Definición:** Representa una operación que actúa sobre los elementos de una estructura de objetos.

```csharp
public interface IDocumentoVisitor {
    void Visitar(Parrafo p); 
    void Visitar(Imagen i);
    void Visitar(Seccion s);
}

public class ContadorEstadisticasVisitor : IDocumentoVisitor {
    public int TotalPalabras { get; private set; }
    public void Visitar(Parrafo p) { TotalPalabras += p.Palabras; }
}
```

**Cuándo aplicar:** Cuando necesitas múltiples operaciones sobre una estructura de objetos estable, o cuando las operaciones cambian con frecuencia pero los tipos de elementos no.

---

## 4. Principios SOLID y su Relación con los Patrones GoF

Los patrones de diseño GoF son materializaciones concretas de los principios SOLID:

| Principio | Patrones que lo implementan |
|-----------|----------------------------|
| **SRP** (Responsabilidad Única) | Facade, Decorator, Proxy |
| **OCP** (Abierto/Cerrado) | Strategy, Observer, Command, State, Template Method |
| **LSP** (Sustitución de Liskov) | Todos (polimorfismo) |
| **ISP** (Segregación de Interfaces) | Iterator, Composite, Visitor |
| **DIP** (Inversión de Dependencias) | Abstract Factory, Adapter, Bridge, Strategy, Mediator |

---

## 5. Guía de Decisión Rápida

| ¿Qué necesitas? | Patrón recomendado |
|-----------------|-------------------|
| Garantizar una única instancia | Singleton |
| Delegar creación a subclases | Factory Method |
| Crear familias de objetos compatibles | Abstract Factory |
| Construir objetos complejos con muchos parámetros | Builder |
| Clonar objetos en lugar de crearlos | Prototype |
| Traducir interfaces incompatibles | Adapter |
| Desacoplar abstracción de implementación | Bridge |
| Tratar hojas y contenedores uniformemente | Composite |
| Añadir funcionalidad dinámicamente | Decorator |
| Simplificar API compleja | Facade |
| Compartir objetos para ahorrar memoria | Flyweight |
| Controlar acceso a un objeto | Proxy |
| Cadena de procesamiento | Chain of Responsibility |
| Encapsular acciones con deshacer | Command |
| Interpretar un lenguaje o DSL | Interpreter |
| Recorrer estructuras complejas | Iterator |
| Centralizar comunicación entre componentes | Mediator |
| Checkpoint/rollback | Memento |
| Notificación automática a múltiples objetos | Observer |
| Comportamiento según estado | State |
| Algoritmos intercambiables | Strategy |
| Esqueleto de algoritmo con variaciones | Template Method |
| Añadir operaciones sin modificar clases | Visitor |

---

## 6. Anti-Patrones Comunes

**Sobre-ingeniería con Singleton:** Usar Singleton para cualquier clase genera acoplamiento global. En proyectos .NET con DI, registra el servicio con lifetime Singleton.

**Adapter innecesario:** Si puedes modificar la interfaz directamente, refactorízala. Adapter es para código que no controlas.

**Decorator infinito:** Encadenar demasiados decoradores dificulta la depuración. Si el pipeline supera los 5-6 niveles, refactoriza.

**State vs Strategy confundido:** Si las transiciones son controladas externamente, usa Strategy. Si ocurren internamente, usa State.

---

## 7. Conclusión

Los patrones GoF siguen siendo plenamente relevantes en el ecosistema actual. Lenguajes modernos como C# ofrecen características que permiten implementaciones más limpias: tipos genéricos, expresiones lambda, métodos de extensión y pattern matching.

En proyectos .NET modernos con inyección de dependencias, los contenedores implementan indirectamente muchos de estos patrones. Los lifetimes Singleton, Scoped y Transient cubren escenarios que históricamente requerían implementaciones manuales.

La clave está en identificar primero los code smells: bloques switch/if grandes, acoplamiento excesivo, duplicación de código y clases con múltiples responsabilidades son señales de que un patrón podría mejorar el diseño.