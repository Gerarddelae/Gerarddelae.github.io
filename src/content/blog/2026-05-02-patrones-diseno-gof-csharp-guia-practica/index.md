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

Cada patrón se documenta con una estructura estándar que incluye su intención, motivación, estructura (diagrama UML), participantes, colaboraciones y consecuencias. En el ecosistema actual, estos patrones siguen siendo plenamente relevantes. Lenguajes modernos como C# ofrecen características que permiten implementaciones más limpias de estos patrones respecto a las versiones originales descritas en C++ en 1994.

---

## 1. Introducción y Clasificación

Los patrones GoF se organizan en tres categorías según su propósito:

| **Categoría** | **Propósito** | **Patrones incluidos** |
|----------------|---------------|------------------------|
| **Creacionales** | Abstraen el proceso de creación de objetos | Singleton, Factory Method, Abstract Factory, Builder, Prototype |
| **Estructurales** | Componen clases y objetos para formar estructuras mayores | Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy |
| **De Comportamiento** | Gestionan la comunicación y distribución de responsabilidades | Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor |

---

## 2. Patrones Creacionales

Los patrones creacionales abstraen el proceso de instanciación de objetos. Su propósito central es desacoplar el código cliente de las clases concretas que necesita crear, proporcionando mecanismos que hacen que el sistema sea más flexible frente a cambios en la estructura o el tipo de objetos que utiliza.

### 2.1 Singleton

**Intención:** Garantizar que una clase tenga únicamente una instancia y proporcionar un punto de acceso global a ella.

**Problema que resuelve:** En muchas aplicaciones existe la necesidad de tener una única instancia de una clase que coordine recursos compartidos: configuración global, conexión a base de datos, servicio de logging, caché de aplicación, pool de conexiones, etc. Si permitimos la creación de múltiples instancias, podemos terminar con estados inconsistentes o consumo innecesario de recursos.

**Estructura UML:**
```
+------------------+
|    Singleton     |
+------------------+
| - instance       |
| - data           |
+------------------+
| + Instance       |-----+
| + Operation()    |     |
+------------------+     |
                         v
                  [Cliente]
```

**Participantes:**
- **Singleton:** Define una operación Instance que permite a los clientes acceder a su única instancia. Puede ser responsable de crear su propia única instancia.

**Colaboración:** Los clientes acceden a una instancia Singleton únicamente a través de la operación Instance.

**Implementación en C# con seguridad para hilos:**

```csharp
public sealed class ConfiguracionApp {
    private static readonly Lazy<ConfiguracionApp> _instancia = 
        new Lazy<ConfiguracionApp>(() => new ConfiguracionApp(), 
                                    LazyThreadSafetyMode.ExecutionAndPublication);
    
    public static ConfiguracionApp Instancia => _instancia.Value;
    
    public string NombreAplicacion { get; private set; }
    public string Version { get; private set; }
    public Dictionary<string, string> Configuracion { get; }
    
    private ConfiguracionApp() {
        NombreAplicacion = "Devolio";
        Version = "1.0.0";
        Configuracion = new Dictionary<string, string> {
            ["Ambiente"] = "Produccion",
            ["Timeout"] = "30",
            ["MaxConexiones"] = "100"
        };
    }
    
    public string ObtenerConfiguracion(string clave) {
        return Configuracion.TryGetValue(clave, out var valor) ? valor : null;
    }
}

// Uso:
var config = ConfiguracionApp.Instancia;
Console.WriteLine($"App: {config.NombreAplicacion} v{config.Version}");
```

**Variantes comunes:**
- **Inicialización inmediata:** La instancia se crea al cargar la clase. Simple pero no diferida.
- **Inicialización diferida con bloqueo de doble verificación:** segura para hilos sin bloqueo excesivo.
- **Lazy<T> (recomendado en C# 4.5+):** Segura para hilos por defecto, código más limpio.

**Cuándo aplicar:**
- Necesitas exactamente una instancia de una clase para coordinar operaciones
- Necesitas acceso controlado a un recurso compartido (logger, caché, pool de conexiones)
- El estado debe ser global y consistente entre todas las partes de la aplicación

**Consideraciones:**
- Puede dificultar el testing unitario porque introduce estado global
- En aplicaciones ASP.NET Core modernas, es preferible usar inyección de dependencias con lifetime Singleton
- Puede ser un indicio de acoplamiento excesivo si se usa en exceso

**Relación con SOLID:**
- Puede violar SRP si la clase Singleton asume responsabilidades adicionales
- Facilita el cumplimiento de DIP al proporcionar una abstracción clara

---

### 2.2 Factory Method

**Intención:** Definir una interfaz para crear un objeto, pero dejar que las subclases decidan qué clase instanciar.

**Problema que resuelve:** En muchos sistemas, el código cliente no conoce de antemano qué clase concreta necesita instanciar. La decisión puede depender de configuración, del tipo de usuario, del entorno de ejecución, o de otros factores que pueden cambiar con el tiempo. Si el código cliente depende directamente de clases concretas, cualquier cambio requiere modificar múltiples puntos del código.

**Estructura UML:**
```
+---------------+       +--------------------+
|   Creator     |       |     Product        |
+---------------+       +--------------------+
| + Factory()   |------>| + Operation()       |
+---------------+       +--------------------+
        |                        ^
        |                        |
+--------+--------+    +---------+--------+
|ConcreteCreator |    |ConcreteProduct    |
+--------+-------+    +-------------------+
| +Factory()     |    | + Operation()     |
+----------------+    +-------------------+
```

**Participantes:**
- **Product:** Define la interfaz de los objetos que el Factory Method crea
- **ConcreteProduct:** Implementa la interfaz Product
- **Creator:** Declara el Factory Method, puede definir una implementación por defecto
- **ConcreteCreator:** Redefine el Factory Method para devolver una instancia de ConcreteProduct

**Implementación en C#:**

```csharp
// Producto (interfaz)
public abstract class Notificacion {
    public abstract void Enviar(string destinatario, string mensaje);
    public abstract string Tipo { get; }
}

// Productos concretos
public class NotificacionEmail : Notificacion {
    public override string Tipo => "EMAIL";
    
    public override void Enviar(string destinatario, string mensaje) {
        Console.WriteLine($"[EMAIL] Enviando a {destinatario}: {mensaje}");
        // Lógica de envío por SMTP
    }
}

public class NotificacionSMS : Notificacion {
    public override string Tipo => "SMS";
    
    public override void Enviar(string destinatario, string mensaje) {
        Console.WriteLine($"[SMS] Enviando a {destinatario}: {mensaje}");
        // Lógica de envío por API de SMS
    }
}

public class NotificacionPush : Notificacion {
    public override string Tipo => "PUSH";
    
    public override void Enviar(string destinatario, string mensaje) {
        Console.WriteLine($"[PUSH] Enviando a {destinatario}: {mensaje}");
        // Lógica de Firebase/APNs
    }
}

// Creator abstracto
public abstract class FabricaNotificacion {
    // Factory Method
    public abstract Notificacion CrearNotificacion();
    
    // Template Method que usa el factory
    public void Notificar(string destinatario, string mensaje) {
        var notificacion = CrearNotificacion();
        Console.WriteLine($"Usando notificación tipo: {notificacion.Tipo}");
        notificacion.Enviar(destinatario, mensaje);
    }
}

// Concrete Creators
public class FabricaEmail : FabricaNotificacion {
    public override Notificacion CrearNotificacion() => new NotificacionEmail();
}

public class FabricaSMS : FabricaNotificacion {
    public override Notificacion CrearNotificacion() => new NotificacionSMS();
}

public class FabricaPush : FabricaNotificacion {
    public override Notificacion CrearNotificacion() => new NotificacionPush();
}

// Uso con inversión de dependencias
public class ServicioNotificaciones {
    private readonly FabricaNotificacion _fabrica;
    
    public ServicioNotificaciones(FabricaNotificacion fabrica) {
        _fabrica = fabrica;
    }
    
    public void EnviarAlerta(string usuario, string mensaje) {
        _fabrica.Notificar(usuario, mensaje);
    }
}

// Configuración según tipo de usuario
FabricaNotificacion ObtenerFabricaPorUsuario(TipoUsuario tipo) {
    return tipo switch {
        TipoUsuario.Premium => new FabricaPush(),
        TipoUsuario.Estandar => new FabricaEmail(),
        TipoUsuario.Basico => new FabricaSMS(),
        _ => new FabricaEmail()
    };
}
```

**Cuándo aplicar:**
- Una clase no puede anticipar la clase de objeto que debe crear
- Una clase quiere que sus subclases especifiquen los objetos que crea
- Necesitas delegar la responsabilidad a subclases para lograr extensibilidad

**Consideraciones:**
- Proporciona ganchos para que las subclases personalicen el comportamiento
- Conecta jerarquías de clases paralelas (Creator y Product)
- Puede usarse en conjunto con otros patrones como Abstract Factory, Template Method

**Relación con SOLID:**
- Implementa el Principio de Inversión de Dependencias: "depende de abstracciones, no de concreciones"
- Facilita el cumplimiento de OCP al permitir extensión sin modificación

---

### 2.3 Abstract Factory

**Intención:** Proporcionar una interfaz para crear familias de objetos relacionados o dependientes sin especificar sus clases concretas.

**Problema que resuelve:** Cuando un sistema necesita crear objetos que pertenecen a familias relacionadas y deben utilizarse juntos. Por ejemplo, una aplicación multiplataforma necesita crear interfaces de usuario que sean consistentes: botones, textboxes y menús de Windows deben tener un estilo diferente a los de macOS. Si el código cliente crea objetos de diferentes familias mezclados, la consistencia se rompe.

**Estructura UML:**
```
+-------------+        +-------------+
|AbstractFact.|        | AbstractProd|
+-------------+        +-------------+
|+CreateA()   |------->|+Operation() |
|+CreateB()   |        +-------------+
+-------------+        ^  ^  ^
        |             |  |  |
+------+-------+  +---+--+--+---+  +---+--+--+---+
|ConcreteFact1 |  |ConcreteProdA1 |  |ConcreteProdB1|
+------+-------+  +---------------+  +---------------+
| +CreateA()   |  
| +CreateB()   |
+------+-------+

         v
+------+-------+  +---------------+  +---------------+
|ConcreteFact2 |  |ConcreteProdA2 |  |ConcreteProdB2|
+------+-------+  +---------------+  +---------------+
```

**Participantes:**
- **AbstractFactory:** Declara operaciones para crear productos abstractos
- **ConcreteFactory:** Implementa las operaciones para crear productos concretos
- **AbstractProduct:** Declara una interfaz para un tipo de producto
- **ConcreteProduct:** Define un producto a crear por el factory correspondiente
- **Client:** Usa las interfaces declaradas por AbstractFactory y AbstractProduct

**Implementación en C#:**

```csharp
// Productos Abstractos
public interface IBoton {
    void Renderizar();
    string Estilo { get; }
}

public interface ITextBox {
    void Renderizar();
    bool Habilitado { get; set; }
}

public interface IMenu {
    void Renderizar();
    List<string> Opciones { get; }
}

// Familia Windows
public class BotonWindows : IBoton {
    public string Estilo => "Windows Classic";
    public void Renderizar() => Console.WriteLine("Renderizando botón Windows");
}

public class TextBoxWindows : ITextBox {
    public bool Habilitado { get; set; } = true;
    public void Renderizar() => Console.WriteLine("Renderizando TextBox Windows");
}

public class MenuWindows : IMenu {
    public List<string> Opciones { get; } = new() { "Archivo", "Editar", "Ver", "Ayuda" };
    public void Renderizar() => Console.WriteLine("Renderizando menú Windows");
}

// Familia macOS
public class BotonMac : IBoton {
    public string Estilo => "macOS Aqua";
    public void Renderizar() => Console.WriteLine("Renderizando botón macOS");
}

public class TextBoxMac : ITextBox {
    public bool Habilitado { get; set; } = true;
    public void Renderizar() => Console.WriteLine("Renderizando TextBox macOS");
}

public class MenuMac : IMenu {
    public List<string> Opciones { get; } = new() { "Apple", "File", "Edit", "View" };
    public void Renderizar() => Console.WriteLine("Renderizando menú macOS");
}

// Factory Abstracto
public interface IUIFactory {
    IBoton CrearBoton();
    ITextBox CrearTextBox();
    IMenu CrearMenu();
}

// Factories Concretos
public class WindowsUIFactory : IUIFactory {
    public IBoton CrearBoton() => new BotonWindows();
    public ITextBox CrearTextBox() => new TextBoxWindows();
    public IMenu CrearMenu() => new MenuWindows();
}

public class MacUIFactory : IUIFactory {
    public IBoton CrearBoton() => new BotonMac();
    public ITextBox CrearTextBox() => new TextBoxMac();
    public IMenu CrearMenu() => new MenuMac();
}

// Código cliente que trabaja con abstracciones
public class AplicacionGUI {
    private readonly IBoton _boton;
    private readonly ITextBox _textBox;
    private readonly IMenu _menu;
    
    public AplicacionGUI(IUIFactory factory) {
        _boton = factory.CrearBoton();
        _textBox = factory.CrearTextBox();
        _menu = factory.CrearMenu();
    }
    
    public void Renderizar() {
        _menu.Renderizar();
        _boton.Renderizar();
        _textBox.Renderizar();
    }
}

// Uso
public static class Program {
    public static void Main() {
        IUIFactory factory = ObtenerFactorySegunSO();
        var app = new AplicacionGUI(factory);
        app.Renderizar();
    }
    
    static IUIFactory ObtenerFactorySegunSO() {
        return Environment.OSVersion.Platform == PlatformID.MacOSX 
            ? new MacUIFactory() 
            : new WindowsUIFactory();
    }
}
```

**Cuándo aplicar:**
- El sistema debe ser independiente de cómo se crean, componen y representan sus productos
- El sistema debe configurarse con una de varias familias de productos
- Los productos de una familia deben usarse juntos
-Quieres proporcionar una biblioteca de productos sin revelar sus implementaciones

**Consideraciones:**
- Añadir nuevos productos (tipos de UI) requiere modificar todas las factories
- El patrón es más efectivo cuando los productos son realmente incompatibles entre familias
- Puede combinarse con Prototype o Builder para mayor flexibilidad

**Relación con SOLID:**
- DIP: El código cliente depende de abstracciones (IUIFactory), no de concreciones
- OCP: Se pueden añadir nuevas familias sin modificar el código existente

---

### 2.4 Builder

**Intención:** Separar la construcción de un objeto complejo de su representación, de modo que el mismo proceso de construcción pueda crear diferentes representaciones.

**Problema que resuelve:** Cuando un objeto tiene muchos parámetros, especialmente parámetros opcionales, los constructores se vuelven difíciles de leer y usar. Además, la construcción puede requerir pasos secuenciales donde el orden importa, o diferentes variantes del objeto requieren diferentes procesos de construcción.

**Estructura UML:**
```
+--------+         +----------+
| Builder|<------>|  Director |
+--------+         +----------+
|+BuildPart()     |+Construct()|
+--------+        +----------+
     ^                  ^
     |                  |
+----+----+     +------+------+
|ConcreteB|     | Client      |
+--------+     +-------------+
|+BuildPart()  |
|+GetResult()  |
+--------+
```

**Participantes:**
- **Builder:** Especifica una interfaz abstracta para crear partes de un objeto Product
- **ConcreteBuilder:** Construye y ensambla las partes del producto
- **Director:** Construye un objeto usando la interfaz Builder
- **Product:** El objeto bajo construcción

**Implementación en C# con Fluent API:**

```csharp
// Producto
public class Pizza {
    public string Masa { get; private set; }
    public string Salsa { get; private set; }
    public List<string> Ingredientes { get; } = new();
    public string Tamanio { get; private set; }
    
    public override string ToString() => 
        $"Pizza {Tamanio}: {Masa}, {Salsa}, {string.Join(", ", Ingredientes)}";
}

// Builder abstracto
public interface IPizzaBuilder {
    IPizzaBuilder ConMasa(string masa);
    IPizzaBuilder ConSalsa(string salsa);
    IPizzaBuilder AgregarIngrediente(string ingrediente);
    IPizzaBuilder DeTamanio(string tamanio);
    Pizza Build();
}

// Builder concreto
public class PizzaBuilder : IPizzaBuilder {
    private readonly Pizza _pizza = new();
    
    public IPizzaBuilder ConMasa(string masa) {
        _pizza.Masa = masa;
        return this;
    }
    
    public IPizzaBuilder ConSalsa(string salsa) {
        _pizza.Salsa = salsa;
        return this;
    }
    
    public IPizzaBuilder AgregarIngrediente(string ingrediente) {
        _pizza.Ingredientes.Add(ingrediente);
        return this;
    }
    
    public IPizzaBuilder DeTamanio(string tamanio) {
        _pizza.Tamanio = tamanio;
        return this;
    }
    
    public Pizza Build() => _pizza;
}

// Director (opcional - puede usar el builder directamente)
public class Pizzero {
    public Pizza ConstruirPizzaVegetariana(IPizzaBuilder builder) {
        return builder
            .DeTamanio("Mediana")
            .ConMasa("Integral")
            .ConSalsa("Tomate")
            .AgregarIngrediente("Queso mozzarella")
            .AgregarIngrediente("Champiñones")
            .AgregarIngrediente("Pimientos")
            .AgregarIngrediente("Aceitunas")
            .Build();
    }
    
    public Pizza ConstruirPizzaCarnivora(IPizzaBuilder builder) {
        return builder
            .DeTamanio("Grande")
            .ConMasa("Tradicional")
            .ConSalsa("Barbacoa")
            .AgregarIngrediente("Queso cheddar")
            .AgregarIngrediente("Jamón")
            .AgregarIngrediente("Pepperoni")
            .AgregarIngrediente("Tocino")
            .Build();
    }
}

// Uso directo con Fluent API
var pizzaPersonalizada = new PizzaBuilder()
    .DeTamanio("Familiar")
    .ConMasa("Crujiente")
    .ConSalsa("Carbonara")
    .AgregarIngrediente("Queso quatro quesos")
    .AgregarIngrediente("Pollo")
    .AgregarIngrediente("Cebollas")
    .Build();

// Uso con Director
var director = new Pizzero();
var vegetariana = director.ConstruirPizzaVegetariana(new PizzaBuilder());
var carnivora = director.ConstruirPizzaCarnivora(new PizzaBuilder());
```

**Implementación alternativa con objetos de especificación (más simple para casos weniger complejos):**

```csharp
public class OrdenReparacion {
    // Using pattern matching y Primary Constructors en C# 12
    public required string Cliente { init; }
    public required string TipoEquipo { init; }
    public string? DescripcionProblema { init; }
    public List<string> Repuestos { init; } = new();
    public decimal Presupuesto { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public Prioridad prioridad { get; set; } = Prioridad.Normal;
}

public enum Prioridad { Baja, Normal, Alta, Urgente }

// Uso con inicializador de objetos
var orden = new OrdenReparacion {
    Cliente = "Juan Pérez",
    TipoEquipo = "Laptop",
    DescripcionProblema = "No enciende",
    Repuestos = new List<string> { "Placa madre", "Memoria RAM" },
    prioridad = Prioridad.Urgente
};
```

**Cuándo aplicar:**
- Un objeto tiene muchos parámetros, especialmente opcionales
- La construcción del objeto requiere pasos secuenciales
- Necesitas diferentes representaciones del mismo proceso de construcción
- quieres aislar el código de construcción del código de negocio

**Consideraciones:**
- El código es más verbose que un constructor directo
- Útil cuando el proceso de construcción es complejo o puede variar
- Builder y Abstract Factory pueden usarse juntos

---

### 2.5 Prototype

**Intención:** Especificar los tipos de objetos a crear mediante la clonación de un prototipo existente, en lugar de crearlos desde cero.

**Problema que resuelve:** Crear nuevos objetos desde cero puede ser costoso (consultas a base de datos, llamadas a APIs externas, cálculos complejos). Si necesitas crear múltiples objetos que son similares, puede ser más eficiente clonar un prototipo existente que tiene el estado base ya calculado.

**Estructura UML:**
```
+-------------+       +-------------+
|   Client    |       |  Prototype  |
+-------------+       +-------------+
|             |------>| +Clone()    |
+-------------+       +-------------+
                             ^
                             |
                    +--------+--------+
                    |ConcretePrototype|
                    +-----------------+
                    | +Clone()        |
                    +-----------------+
```

**Participantes:**
- **Prototype:** Declara una interfaz para clonarse
- **ConcretePrototype:** Implementa la operación de clonación
- **Client:** Pide a un prototipo que se clone

**Implementación en C#:**

```csharp
// Interfaz Prototype
public interface IPrototype<T> {
    T Clonar();
}

// Prototype concreto - Configuración de producto
public class ConfiguracionProducto : IPrototype<ConfiguracionProducto> {
    public string Nombre { get; set; }
    public string Categoria { get; set; }
    public decimal PrecioBase { get; set; }
    public Dictionary<string, object> Atributos { get; set; } = new();
    public List<string> Tags { get; set; } = new();
    
    public ConfiguracionProducto Clonar() {
        // Clonación profunda
        return new ConfiguracionProducto {
            Nombre = this.Nombre,
            Categoria = this.Categoria,
            PrecioBase = this.PrecioBase,
            Atributos = new Dictionary<string, object>(this.Atributos),
            Tags = new List<string>(this.Tags)
        };
    }
}

// Prototype Registry
public class CatalogoPrototipos {
    private readonly Dictionary<string, ConfiguracionProducto> _prototipos = new();
    
    public void Registrar(string clave, ConfiguracionProducto prototipo) {
        _prototipos[clave] =-prototipo;
    }
    
    public ConfiguracionProducto Clonar(string clave) {
        if (!_prototipos.TryGetValue(clave, out var prototipo))
            throw new KeyNotFoundException($"Prototipo '{clave}' no encontrado");
        
        return prototipo.Clonar();
    }
    
    public IEnumerable<string> ObtenerClaves() => _prototipos.Keys;
}

// Uso
var catalogo = new CatalogoPrototipos();

// Registrar prototipos base
catalogo.Registrar("camiseta-basica", new ConfiguracionProducto {
    Nombre = "Camiseta Algodón",
    Categoria = "Ropa",
    PrecioBase = 25000,
    Atributos = new Dictionary<string, object> {
        ["Material"] = "Algodón 100%",
        ["Tallas"] = "S,M,L,XL"
    },
    Tags = new List<string> { "basico", "algodon" }
});

catalogo.Registrar("pantalon-jeans", new ConfiguracionProducto {
    Nombre = "Pantalón Jeans Classic",
    Categoria = "Pantalones",
    PrecioBase = 89000,
    Atributos = new Dictionary<string, object> {
        ["Material"] = "Denim",
        ["Corte"] = "Regular"
    },
    Tags = new List<string> { "jeans", "formal" }
});

// Clonar y personalizar
var camisetaRoja = catalogo.Clonar("camiseta-basica");
camisetaRoja.Nombre = "Camiseta Roja";
camisetaRoja.Atributos["Color"] = "Rojo";
camisetaRoja.Tags.Add("rojo");

var camisetaAzul = catalogo.Clonar("camiseta-basica");
camisetaAzul.Nombre = "Camiseta Azul";
camisetaAzul.Atributos["Color"] = "Azul";
camisetaAzul.Tags.Add("azul");
```

**Consideraciones sobre clonación:**
- **Clonación superficial vs profunda:** La superficial copia referencias, la profunda copia los objetos referenciados también
- C# tiene ICloneable pero no se recomienda su uso; mejor definir métodos Clone explícitos
- En escenarios complejos, considerar Serialization para clonación profunda

```csharp
// Clonación mediante serialización (alternativa)
public T Clonar<T>() where T : class {
    using var stream = new MemoryStream();
    var serializer = new System.Text.Json.JsonSerializer();
    serializer.Serialize(stream, this);
    stream.Position = 0;
    return serializer.Deserialize<T>(stream);
}
```

**Cuándo aplicar:**
- Cuando crear un objeto es costoso (BD, red, cálculos)
- Cuando necesitas muchas variaciones de un objeto base
- Cuando quieres evitar subclases para crear objetos
- Para implementar "undo" en aplicaciones

**Consideraciones:**
- La clonación de objetos complejos puede ser tricky (referencias circulares, objetos no serializables)
- A veces es preferible una Factory que cree nuevas instancias

---

### 2.6 Guía de Selección: Patrones Creacionales

| **Señales en tu código** | **Patrón sugerido** | **Pregunta clave** |
|---------------------------|---------------------|-------------------|
| `new` dispersado para el mismo tipo | Singleton | ¿Este objeto debería existir una sola vez? |
| Código cliente no sabe qué clase instanciar | Factory Method | ¿La elección depende de una subclase? |
| Necesitas crear familias completas compatibles | Abstract Factory | ¿Los objetos deben funcionar juntos? |
| Constructor con 6+ parámetros, muchos opcionales | Builder | ¿La construcción requiere múltiples pasos? |
| Crear objetos es costoso y necesitas copias | Prototype | ¿Puedo copiar un objeto existente? |

---

## 3. Patrones Estructurales

Los patrones estructurales abordan el problema de cómo componer clases y objetos para formar estructuras más grandes y flexibles. Promueven la delegación y la composición como alternativas más dinámicas a la herencia, logrando sistemas más desacoplados.

### 3.1 Adapter

**Intención:** Convertir la interfaz de una clase en otra interfaz que los clientes esperan. Adapter permite que clases con interfaces incompatibles trabajen juntas.

**Problema que resuelve:** En el mundo real, sistemas nuevos deben integrarse con sistemas existentes. Las interfaces de estos sistemas legacy no coinciden con lo que el nuevo código espera. Modificar el código legacy puede ser imposible o demasiado arriesgado.

**Estructura UML:**
```
+--------+      +--------+      +----------+
| Client |<---->| Target |<---->| Adapter  |
+--------+      +--------+      +----------+
                |+Request()|     |+Request()|
                +---------+      +----+-----+
                                     |
                                     v
                               +----------+
                               | Adaptee   |
                               +----------+
                               |+Specific()|
                               +----------+
```

**Implementación en C# (Class Adapter - hereda de Adaptee):**

```csharp
// Target (interfaz esperada por el cliente)
public interface IProcesadorPagos {
    bool Procesar(string ordenId, decimal monto, string moneda);
    bool Reembolsar(string transaccionId, decimal monto);
}

// Adaptee (clase existente incompatible)
public class PasarelaPagoLegacy {
    // API antigua con diferentes nombres y tipos
    public int MakeTransaction(string merchantId, string orderId, 
                                double amount, string currency) {
        // Lógica legacy...
        Console.WriteLine($"Legacy: Transacción {orderId} por {amount} {currency}");
        return new Random().Next(1000, 9999); // retorna código de transacción
    }
    
    public bool ReverseTransaction(int transactionCode) {
        Console.WriteLine($"Legacy: Revirtiendo transacción {transactionCode}");
        return true;
    }
}

// Adapter
public class AdaptadorPagoLegacy : IProcesadorPagos {
    private readonly PasarelaPagoLegacy _pasarelaLegacy;
    
    public AdaptadorPagoLegacy(PasarelaPagoLegacy pasarelaLegacy) {
        _pasarelaLegacy = pasarelaLegacy;
    }
    
    public bool Procesar(string ordenId, decimal monto, string moneda) {
        // Traducir entre interfaces
        var resultado = _pasarelaLegacy.MakeTransaction(
            "MERCH-001", 
            ordenId, 
            (double)monto, 
            MapearMoneda(moneda)
        );
        return resultado > 0;
    }
    
    public bool Reembolsar(string transaccionId, decimal monto) {
        // Convertir string a int - potencialmente problemático
        if (int.TryParse(transaccionId, out int codigo)) {
            return _pasarelaLegacy.ReverseTransaction(codigo);
        }
        return false;
    }
    
    private string MapearMoneda(string moneda) {
        return moneda switch {
            "COP" => "COP",
            "USD" => "USD",
            "EUR" => "EUR",
            _ => "USD"
        };
    }
}

// Cliente nuevo que usa la interfaz moderna
public class CarritoCompras {
    private readonly IProcesadorPagos _procesador;
    
    public CarritoCompras(IProcesadorPagos procesador) {
        _procesador = procesador;
    }
    
    public void FinalizarCompra(decimal total) {
        var ordenId = "ORD-" + DateTime.Now.Ticks;
        if (_procesador.Procesar(ordenId, total, "COP")) {
            Console.WriteLine("Pago procesado exitosamente");
        }
    }
}

// Uso
var adaptadore = new AdaptadorPagoLegacy(new PasarelaPagoLegacy());
var carrito = new CarritoCompras(adaptadore);
```

**Variantes:**
- **Adaptador de objeto:** Usa composición (contiene el adaptee)
- **Adaptador de clase:** Usa herencia (hereda del adaptee). Menos flexible.

**Cuándo aplicar:**
- Necesitas integrar una clase o API de terceros cuya interfaz no coincide
- Durante migraciones de sistemas legacy donde se necesita convivencia transitoria
- Cuando no puedes modificar el código del adaptee

**Consideraciones:**
- Si puedes modificar la interfaz del adaptee, refactorízala directamente
- Adapter añade overhead, pero mejora la mantenibilidad

---

### 3.2 Bridge

**Intención:** Desacoplar una abstracción de su implementación, de modo que ambas puedan variar de forma independiente.

**Problema que resuelve:** Cuando tienes dos dimensiones que varían independientemente, como tipos de formas (círculo, rectángulo) y métodos de renderizado (OpenGL, DirectX, Software). Si usas herencia, terminas con una explosión de clases: CírculoOpenGL, CírculoDirectX, RectánguloOpenGL, etc.

**Estructura UML:**
```
     +-------------+          +----------------+
     | Abstraction |<-------->| Implementor    |
     +-------------+          +----------------+
     | +Operation()|          | +OperationImpl()|
     +-------------+          +----------------+
            |                        ^
            |                        |
+----------+----------+    +---------+---------+
|RefinedAbstraction |    |ConcreteImplA     |
+--------------------    +------------------+
| +Operation()          |+OperationImpl()   |
+---------------------  +------------------+
```

**Implementación en C#:**

```csharp
// Implementor (interfaz para la implementación)
public interface IRenderizador {
    void RenderizarCirculo(float x, float y, float radio);
    void RenderizarRectangulo(float x, float y, float ancho, float alto);
    void RenderizarTexto(string texto, float x, float y);
}

// Implementaciones concretas
public class RenderizadorOpenGL : IRenderizador {
    public void RenderizarCirculo(float x, float y, float radio) {
        Console.WriteLine($"OpenGL: Círculo en ({x},{y}) radio {radio}");
    }
    
    public void RenderizarRectangulo(float x, float y, float ancho, float alto) {
        Console.WriteLine($"OpenGL: Rectángulo en ({x},{y}) {ancho}x{alto}");
    }
    
    public void RenderizarTexto(string texto, float x, float y) {
        Console.WriteLine($"OpenGL: Texto '{texto}' en ({x},{y})");
    }
}

public class RenderizadorSVG : IRenderizador {
    public void RenderizarCirculo(float x, float y, float radio) {
        Console.WriteLine($"SVG: <circle cx='{x}' cy='{y}' r='{radio}' />");
    }
    
    public void RenderizarRectangulo(float x, float y, float ancho, float alto) {
        Console.WriteLine($"SVG: <rect x='{x}' y='{y}' width='{ancho}' height='{alto}' />");
    }
    
    public void RenderizarTexto(string texto, float x, float y) {
        Console.WriteLine($"SVG: <text x='{x}' y='{y}'>{texto}</text>");
    }
}

// Abstracción
public abstract class Forma {
    protected IRenderizador Renderizador { get; }
    
    protected Forma(IRenderizador renderizador) {
        Renderizador = renderizador;
    }
    
    public abstract void Dibujar();
}

// Abstracciones refinadas
public class Circulo : Forma {
    private readonly float _x, _y, _radio;
    
    public Circulo(float x, float y, float radio, IRenderizador renderizador) 
        : base(renderizador) {
        _x = x; _y = y; _radio = radio;
    }
    
    public override void Dibujar() {
        Renderizador.RenderizarCirculo(_x, _y, _radio);
    }
}

public class Rectangulo : Forma {
    private readonly float _x, _y, _ancho, _alto;
    
    public Rectangulo(float x, float y, float ancho, float alto, IRenderizador renderizador) 
        : base(renderizador) {
        _x = x; _y = y; _ancho = ancho; _alto = alto;
    }
    
    public override void Dibujar() {
        Renderizador.RenderizarRectangulo(_x, _y, _ancho, _alto);
    }
}

// Uso - combinaciones independientes
var formas = new List<Forma> {
    new Circulo(10, 10, 5, new RenderizadorOpenGL()),
    new Rectangulo(20, 20, 10, 5, new RenderizadorOpenGL()),
    new Circulo(50, 50, 15, new RenderizadorSVG()),
    new Rectangulo(60, 60, 20, 10, new RenderizadorSVG())
};

foreach (var forma in formas) {
    forma.Dibujar();
}
```

**Cuándo aplicar:**
- Cuando quieres evitar una herencia permanente entre una abstracción y su implementación
- Cuando ambas dimensiones varían frecuentemente
- Cuando necesitas cambiar la implementación en tiempo de ejecución
- Cuando la herencia genera una "explosión de clases"

**Consideraciones:**
- Mayor complejidad inicial, pero más flexibilidad a largo plazo
- Útil cuando el cambio es probable en ambas dimensiones

---

### 3.3 Composite

**Intención:** Componer objetos en estructuras de árbol para representar jerarquías parte-todo. Permite tratar objetos individuales y composiciones de manera uniforme.

**Problema que resuelve:** Cuando tu modelo de datos tiene una estructura jerárquica natural (directorios con archivos, organizational, UI con componentes), necesitas operar sobre todos los elementos de la misma manera, ya sean individuales o grupos.

**Estructura UML:**
```
      +----------+
      | Component|
      +----------+
      | +Operation()|
      +----------+
            ^
            |
   +--------+-------+
   |                  |
+------+        +---------+
| Leaf  |        | Composite|
+-------+        +---------+
|       |        | children |
+-------+        +-+-------+
                  | add(), remove()
                  v
```

**Implementación en C#:**

```csharp
// Component
public abstract class ComponenteSistemaArchivos {
    public string Nombre { get; protected set; }
    public abstract long ObtenerTamano();
    public abstract void Mostrar(string sangria = "");
    
    protected ComponenteSistemaArchivos(string nombre) {
        Nombre = nombre;
    }
}

// Leaf (Archivo)
public class Archivo : ComponenteSistemaArchivos {
    private readonly long _tamanoBytes;
    
    public Archivo(string nombre, long tamanoBytes) : base(nombre) {
        _tamanoBytes = tamanoBytes;
    }
    
    public override long ObtenerTamano() => _tamanoBytes;
    
    public override void Mostrar(string sangria = "") {
        Console.WriteLine($"{sangria}📄 {Nombre} ({_tamanoBytes} bytes)");
    }
}

// Composite (Directorio)
public class Directorio : ComponenteSistemaArchivos {
    private readonly List<ComponenteSistemaArchivos> _hijos = new();
    
    public Directorio(string nombre) : base(nombre) { }
    
    public void Agregar(ComponenteSistemaArchivos componente) {
        _hijos.Add(componente);
    }
    
    public void Remover(ComponenteSistemaArchivos componente) {
        _hijos.Remove(componente);
    }
    
    public override long ObtenerTamano() {
        return _hijos.Sum(h => h.ObtenerTamano());
    }
    
    public override void Mostrar(string sangria = "") {
        Console.WriteLine($"{sangria}📁 {Nombre}/");
        foreach (var hijo in _hijos) {
            hijo.Mostrar(sangria + "   ");
        }
    }
}

// Uso - construcción del sistema de archivos
var raiz = new Directorio("proyecto");
var src = new Directorio("src");
var componentes = new Directorio("componentes");
var servicios = new Directorio("servicios");

componentes.Agregar(new Archivo("Button.tsx", 2048));
componentes.Agregar(new Archivo("Input.tsx", 1536));
componentes.Agregar(new Archivo("Modal.tsx", 3072));

servicios.Agregar(new Archivo("AuthService.ts", 4096));
servicios.Agregar(new Archivo("ApiService.ts", 5120));

src.Agregar(componentes);
src.Agregar(servicios);
src.Agregar(new Archivo("index.ts", 1024));

raiz.Agregar(new Directorio("public"));
raiz.Agregar(new Directorio("node_modules"));
raiz.Agregar(src);
raiz.Agregar(new Archivo("package.json", 2048));

// Operaciones uniforme
Console.WriteLine($"Tamaño total: {raiz.ObtenerTamano()} bytes");
raiz.Mostrar();

// Operar solo en hojas
void ProcesarSoloArchivos(ComponenteSistemaArchivos comp) {
    if (comp is Archivo archivo) {
        Console.WriteLine($"Procesando: {archivo.Nombre}");
    }
}
```

**Consideraciones de seguridad:**
- El patrón Composite puede exponer la estructura interna de composición
- Considerar implementar un "Traversal Iterator" para no exponer hijos directamente

**Cuándo aplicar:**
- Cuando el modelo de datos forma jerarquías parte-todo
- Cuando quieres tratar objetos individuales y grupos de manera uniforme
- Cuando necesitas ejecutar operaciones sobre todos los elementos de una estructura recursiva

---

### 3.4 Decorator

**Intención:** Agregar responsabilidades adicionales a un objeto de forma dinámica. Los decoradores proporcionan una alternativa más flexible que la herencia para extender funcionalidad.

**Problema que resuelve:** Cuando necesitas agregar funcionalidad a objetos en tiempo de ejecución, y las combinaciones posibles de características son tantas que la herencia sería impráctica (explosión combinatoria).

**Estructura UML:**
```
      +-----------+      +-------------+
      | Component |<-----|  Decorator  |
      +-----------+      +-------------+
      | +Operation()|    | -component  |
      +-----------+      +-------------+
             ^           | +Operation()|
             |           +-------------+
             |                 ^
             |                 |
      +------+-------+   +------+-------+
      | ConcreteC  |   |ConcretDecorator|
      +------------+   +----------------+
      | +Operation()|   | +Operation()   |
      +------------+   +----------------+
```

**Implementación en C# - Pipeline de procesamiento de pedidos:**

```csharp
// Component
public interface IManejadorPedido {
    ManejadorResult Procesar(Pedido pedido);
}

public class Pedido {
    public string Id { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Descuento { get; set; }
    public decimal Impuesto { get; set; }
    public decimal Total { get; set; }
    public List<string> PasosProcesamiento { get; } = new();
}

public class ManejadorResult {
    public bool Exito { get; set; }
    public string? Error { get; set; }
}

// Concrete Component
public class ManejadorPedidoBase : IManejadorPedido {
    public virtual ManejadorResult Procesar(Pedido pedido) {
        pedido.PasosProcesamiento.Add("Validación básica");
        return new ManejadorResult { Exito = true };
    }
}

// Decorator base
public abstract class DecoradorManejadorPedido : IManejadorPedido {
    protected readonly IManejadorPedido _anterior;
    
    protected DecoradorManejadorPedido(IManejadorPedido anterior) {
        _anterior = anterior;
    }
    
    public virtual ManejadorResult Procesar(Pedido pedido) {
        return _anterior.Procesar(pedido);
    }
}

// Concrete Decorators
public class DecoradorValidacionStock : DecoradorManejadorPedido {
    public DecoradorValidacionStock(IManejadorPedido anterior) : base(anterior) { }
    
    public override ManejadorResult Procesar(Pedido pedido) {
        var resultado = base.Procesar(pedido);
        if (!resultado.Exito) return resultado;
        
        // Lógica de validación de stock
        pedido.PasosProcesamiento.Add("Stock verificado");
        return resultado;
    }
}

public class DecoradorDescuentos : DecoradorManejadorPedido {
    public DecoradorDescuentos(IManejadorPedido anterior) : base(anterior) { }
    
    public override ManejadorResult Procesar(Pedido pedido) {
        var resultado = base.Procesar(pedido);
        if (!resultado.Exito) return resultado;
        
        // Aplicar descuentos
        if (pedido.Subtotal > 100000) {
            pedido.Descuento = pedido.Subtotal * 0.10m;
            pedido.PasosProcesamiento.Add($"Descuento 10%: -{pedido.Descuento:C}");
        }
        return resultado;
    }
}

public class DecoradorImpuestos : DecoradorManejadorPedido {
    public DecoradorImpuestos(IManejadorPedido anterior) : base(anterior) { }
    
    public override ManejadorResult Procesar(Pedido pedido) {
        var resultado = base.Procesar(pedido);
        if (!resultado.Exito) return resultado;
        
        // Calcular impuesto
        pedido.Impuesto = (pedido.Subtotal - pedido.Descuento) * 0.19m;
        pedido.Total = pedido.Subtotal - pedido.Descuento + pedido.Impuesto;
        pedido.PasosProcesamiento.Add($"Impuesto 19%: +{pedido.Impuesto:C}");
        return resultado;
    }
}

public class DecoradorNotificacion : DecoradorManejadorPedido {
    public DecoradorNotificacion(IManejadorPedido anterior) : base(anterior) { }
    
    public override ManejadorResult Procesar(Pedido pedido) {
        var resultado = base.Procesar(pedido);
        if (!resultado.Exito) return resultado;
        
        pedido.PasosProcesamiento.Add("Notificación enviada");
        return resultado;
    }
}

// Uso - construcción del pipeline
var pipeline = new DecoradorNotificacion(
    new DecoradorImpuestos(
        new DecoradorDescuentos(
            new DecoradorValidacionStock(
                new ManejadorPedidoBase()
            )
        )
    )
);

var pedido = new Pedido {
    Id = "ORD-001",
    Subtotal = 150000
};

var resultado = pipeline.Procesar(pedido);

Console.WriteLine($"Pedido: {pedido.Id}");
Console.WriteLine($"Subtotal: {pedido.Subtotal:C}");
Console.WriteLine($"Descuento: {pedido.Descuento:C}");
Console.WriteLine($"Impuesto: {pedido.Impuesto:C}");
Console.WriteLine($"Total: {pedido.Total:C}");
Console.WriteLine("\nPasos:");
foreach (var paso in pedido.PasosProcesamiento) {
    Console.WriteLine($"  - {paso}");
}
```

**Cuándo aplicar:**
- Necesitas agregar funcionalidad dinámicamente y de forma combinable
- La herencia no es viable por el número de combinaciones posibles
- Quiere cumplir con el Open/Closed Principle: añadir decoradores sin modificar clases existentes
- Implementar pipelines de procesamiento (middleware, filtros, etc.)

**Consideraciones:**
- Puede ser difícil depurar cuando hay muchos decoradores anidados
- Orden de los decoradores importa
- A veces un objeto decorado puede ser muy diferente del original

---

### 3.5 Facade

**Intención:** Proporcionar una interfaz unificada para acceder a un subsistema complejo. El Facade simplifica el uso al ocultar las interacciones entre las múltiples clases que lo componen.

**Problema que resuelve:** Los subsistemas frecuentemente tienen muchas clases con APIs complejas. El código cliente no debería conocer ni depender de toda esa complejidad. El Facade proporciona una vista simplificada del subsistema.

**Estructura UML:**
```
+-------------+     +-------+     +-------+
|   Client    |---->| Facade|---->|Class A|
+-------------+     +-------+     +-------+
                    | +Method()|    +-------+
                    +----+----+    |Class B|
                         |          +-------+
                         v          +-------+
                    +----+----+    |Class C|
                    | Subsystem|    +-------+
                    +-----------+
```

**Implementación en C# - Servicio de envíos:

```csharp
// Subsistema complejo - clases internas
public class CalculadorRutas {
    public string CalcularRutaOptima(string origen, string destino, decimal peso) {
        Console.WriteLine($"Calculando ruta: {origen} -> {destino}");
        // Algoritmo complejo de optimización
        return peso > 100 ? "Aérea" : "Terrestre";
    }
}

public class CalculadorCostos {
    public decimal CalcularTarifa(string ruta, decimal peso, decimal valorDeclarado) {
        decimal baseTarifa = ruta == "Aérea" ? 15000m : 8000m;
        decimal costoPeso = peso * (ruta == "Aérea" ? 200m : 50m);
        decimal costoValor = valorDeclarado * 0.01m;
        return baseTarifa + costoPeso + costoValor;
    }
}

public class GestorInventario {
    public bool ReservarEmpaque(string tipoPaquete, int cantidad) {
        Console.WriteLine($"Reservando {cantidad} paquetes de tipo {tipoPaquete}");
        return true;
    }
    
    public void ConfirmarReserva(string codigoReserva) {
        Console.WriteLine($"Reserva confirmada: {codigoReserva}");
    }
}

public class GeneradorDocumentos {
    public string GenerarGuia(string ruta, decimal tarifa) {
        var guia = $"GUIA-{DateTime.Now.Ticks}";
        Console.WriteLine($"Generando guía: {guia}");
        return guia;
    }
    
    public string GenerarFactura(decimal monto) {
        var factura = $"FACT-{DateTime.Now.Ticks}";
        Console.WriteLine($"Generando factura: {factura} por {monto:C}");
        return factura;
    }
}

public class GestorNotificaciones {
    public void NotificarCliente(string email, string mensaje) {
        Console.WriteLine($"Enviando notificación a {email}: {mensaje}");
    }
}

// FACADE - Interfaz unificada
public class ServicioEnviosFacade {
    private readonly CalculadorRutas _rutas;
    private readonly CalculadorCostos _costos;
    private readonly GestorInventario _inventario;
    private readonly GeneradorDocumentos _documentos;
    private readonly GestorNotificaciones _notificaciones;
    
    public ServicioEnviosFacade() {
        _rutas = new CalculadorRutas();
        _costos = new CalculadorCostos();
        _inventario = new GestorInventario();
        _documentos = new GeneradorDocumentos();
        _notificaciones = new GestorNotificaciones();
    }
    
    public ResultadoEnvio CrearEnvio(string origen, string destino, 
                                     decimal peso, decimal valor, string email) {
        // Simplifica toda la complejidad del subsistema
        
        // Paso 1: Calcular ruta
        var ruta = _rutas.CalcularRutaOptima(origen, destino, peso);
        
        // Paso 2: Calcular tarifa
        var tarifa = _costos.CalcularTarifa(ruta, peso, valor);
        
        // Paso 3: Reservar empaque
        var tipoPaquete = peso > 50 ? "Caja grande" : "Sobre";
        _inventario.ReservarEmpaque(tipoPaquete, 1);
        
        // Paso 4: Generar documentación
        var guia = _documentos.GenerarGuia(ruta, tarifa);
        var factura = _documentos.GenerarFactura(tarifa);
        
        // Paso 5: Notificar
        _notificaciones.NotificarCliente(email, $"Envío creado: {guia}");
        
        return new ResultadoEnvio {
            Guia = guia,
            Factura = factura,
            Tarifa = tarifa,
            Ruta = ruta
        };
    }
}

public class ResultadoEnvio {
    public string Guia { get; set; }
    public string Factura { get; set; }
    public decimal Tarifa { get; set; }
    public string Ruta { get; set; }
}

// Uso - muy simple para el cliente
var servicio = new ServicioEnviosFacade();
var resultado = servicio.CrearEnvio(
    "Bogotá", 
    "Medellín", 
    25m, 
    500000m, 
    "cliente@email.com"
);

Console.WriteLine($"Guía: {resultado.Guia}, Tarifa: {resultado.Tarifa:C}");
```

**Cuándo aplicar:**
- Un subsistema tiene múltiples clases con APIs complejas
- Necesitas proporcionar una interfaz simple para casos de uso frecuentes
- Quieres desacoplar el código cliente de la implementación interna
- Estás construyendo una capa de servicios que coordina múltiples repositorios

**Consideraciones:**
- El Facade no oculta toda la complejidad, solo la simplify para casos comunes
- Los clientes aún pueden acceder a las clases del subsistema directamente si necesitan más control
- Facade y Abstract Factory pueden usarse juntos

---

### 3.6 Flyweight

**Intención:** Usar compartir efficiently objetos que se usan repetidamente para minimizar el consumo de memoria.

**Problema que resuelve:** Cuando una aplicación necesita manejar un número muy grande de objetos, y la memoria se convierte en un problema. Muchos de estos objetos pueden compartir estado intrínseco (interno), mientras que el estado extrínseco (externo) lo proporciona el cliente.

**Estructura UML:**
```
+------------------+     +---------------+
|   FlyweightFactory|---->| Flyweight     |
+------------------+     +---------------+
| -flyweights      |     | +Operation()  |
| +GetFlyweight()  |     +---------------+
+------------------+            ^
                               |
                    +--------+--------+
                    |ConcreteFlyweight|
                    +-----------------+
                    | -intrinsicState |
                    +-----------------+
```

**Implementación en C# - Sistema de rendering de texto:**

```csharp
public interface IEstiloTexto {
    string Renderizar(string texto);
}

// Flyweight - comparte estado intrínseco
public class EstiloTexto : IEstiloTexto {
    public string FamiliaFuente { get; }
    public int Tamano { get; }
    public string Color { get; }
    public bool Negrita { get; }
    public bool Cursiva { get; }
    
    // Estado intrínseco (compartido, inmutable)
    public EstiloTexto(string familia, int tamano, string color, 
                        bool negrita, bool cursiva) {
        FamiliaFuente = familia;
        Tamano = tamano;
        Color = color;
        Negrita = negrita;
        Cursiva = cursiva;
    }
    
    public string Renderizar(string texto) {
        var style = $"font-family:{FamiliaFuente}; font-size:{Tamano}px; color:{Color}";
        if (Negrita) style += "; font-weight:bold";
        if (Cursiva) style += "; font-style:italic";
        return $"<span style=\"{style}\">{texto}</span>";
    }
}

// Flyweight Factory
public class FabricaEstilos {
    private readonly Dictionary<string, IEstiloTexto> _pool = new();
    
    public IEstiloTexto ObtenerEstilo(string familia, int tamano, string color,
                                       bool negrita, bool cursiva) {
        var key = $"{familia}|{tamano}|{color}|{negrita}|{cursiva}";
        
        if (!_pool.TryGetValue(key, out var estilo)) {
            estilo = new EstiloTexto(familia, tamano, color, negrita, cursiva);
            _pool[key] = estilo;
            Console.WriteLine($"Creando nuevo estilo: {key}");
        }
        
        return estilo;
    }
    
    public int TotalEstilos => _pool.Count;
}

// Contexto (estado extrínseco)
public class TextoRenderizado {
    public string Contenido { get; }
    public IEstiloTexto Estilo { get; }
    public float PosicionX { get; }
    public float PosicionY { get; }
    
    public TextoRenderizado(string contenido, IEstiloTexto estilo, 
                            float x, float y) {
        Contenido = contenido;
        Estilo = estilo;
        PosicionX = x;
        PosicionY = y;
    }
    
    public string Renderizar() {
        return Estilo.Renderizar(Contenido);
    }
}

// Uso
var fabrica = new FabricaEstilos();
var documentos = new List<TextoRenderizado>();

// Crear muchos textos - solo se crean 3 estilos únicos
documentos.Add(new TextoRenderizado("Título Principal", 
    fabrica.ObtenerEstilo("Arial", 24, "negro", true, false), 0, 0));

documentos.Add(new TextoRenderizado("Subtítulo", 
    fabrica.ObtenerEstilo("Arial", 18, "gris", false, true), 0, 30));

documentos.Add(new TextoRenderizado("Párrafo 1", 
    fabrica.ObtenerEstilo("Arial", 12, "negro", false, false), 0, 60));

documentos.Add(new TextoRenderizado("Párrafo 2", 
    fabrica.ObtenerEstilo("Arial", 12, "negro", false, false), 0, 90));

documentos.Add(new TextoRenderizado("Importante", 
    fabrica.ObtenerEstilo("Arial", 12, "rojo", true, false), 0, 120));

Console.WriteLine($"Total de estilos en pool: {fabrica.TotalEstilos}");
Console.WriteLine($"Total de textos: {documentos.Count}");
```

**Estado intrínseco vs extrínseco:**
- **Intrínseco:** Compartido, no depende del contexto (fuente, tamaño, color)
- **Extrínseco:** Proporcionado por el cliente, varía según contexto (posición, contenido)

**Cuándo aplicar:**
- La aplicación necesita manejar un gran número de objetos
- La mayoría del estado del objeto puede ser extrínseco
- Los objetos compartidos pueden ser inmutables

**Consideraciones:**
- Introduce complejidad adicional
- El pooling puede no ser necesario si el número de objetos es manageable
- Considerar lazy loading

---

### 3.7 Proxy

**Intención:** Proporcionar un sustituto o representante de otro objeto para controlar el acceso a él.

**Problema que resuelve:** A veces crear un objeto real es costoso (memoria, red, CPU), o el acceso necesita control adicional (permisos, logging, validación). El proxy permite controlar el acceso sin modificar el objeto real.

**Estructura UML:**
```
+--------+      +--------+      +-----------+
| Client |<---->| Subject|<---->| Proxy     |
+--------+      +--------+      +-----------+
                |+Request()|    |+Request() |
                +---------+      +----+-----+
                                   | realSubject
                                   v
                             +-----------+
                             |RealSubject |
                             +-----------+
                             |+Request()  |
                             +-----------+
```

**Tipos de Proxy:**
1. **Virtual Proxy:** Diferir creación costosa hasta que sea necesaria
2. **Protection Proxy:** Controlar acceso basado en permisos
3. **Remote Proxy:** Representar objeto en otro espacio de direcciones
4. **Smart Reference:** Añadir acciones adicionales al acceder al objeto
5. **Cache Proxy:** Almacenar resultados de operaciones costosas

**Implementación en C# - Virtual Proxy y Protection Proxy:**

```csharp
// Subject (interfaz común)
public interface IImagen {
    void Mostrar();
    string Nombre { get; }
}

// Real Subject (costoso de crear)
public class ImagenReal : IImagen {
    private readonly string _nombreArchivo;
    private byte[]? _datos;
    
    public string Nombre => _nombreArchivo;
    
    public ImagenReal(string nombreArchivo) {
        _nombreArchivo = nombreArchivo;
        Console.WriteLine($"Cargando imagen {nombreArchivo} desde disco...");
        // Simulamos carga costosa
        Thread.Sleep(1000); 
        _datos = new byte[1024 * 100]; // 100KB simulados
    }
    
    public void Mostrar() {
        Console.WriteLine($"Mostrando imagen: {_nombreArchivo} ({_datos?.Length} bytes)");
    }
}

// Virtual Proxy (lazy loading)
public class ImagenProxy : IImagen {
    private readonly string _nombreArchivo;
    private ImagenReal? _imagenReal;
    
    public string Nombre => _nombreArchivo;
    
    public ImagenProxy(string nombreArchivo) {
        _nombreArchivo = nombreArchivo;
    }
    
    public void Mostrar() {
        // Lazy loading: solo crear el objeto real cuando se necesita
        _imagenReal ??= new ImagenReal(_nombreArchivo);
        _imagenReal.Mostrar();
    }
}

// Protection Proxy (control de acceso)
public class ImagenProxyProtegida : IImagen {
    private readonly ImagenReal _imagenReal;
    private readonly string _usuarioActual;
    
    public string Nombre => _imagenReal.Nombre;
    
    public ImagenProxyProtegida(string nombreArchivo, string usuario) {
        _imagenReal = new ImagenReal(nombreArchivo);
        _usuarioActual = usuario;
    }
    
    public void Mostrar() {
        if (!TienePermiso()) {
            Console.WriteLine($"Acceso denegado para usuario {_usuarioActual}");
            return;
        }
        _imagenReal.Mostrar();
    }
    
    private bool TienePermiso() {
        var usuariosPermitidos = new[] { "admin", "editor", "gerente" };
        return usuariosPermitidos.Contains(_usuarioActual.ToLower());
    }
}

// Cache Proxy
public class ImagenProxyCache : IImagen {
    private readonly Dictionary<string, (IImagen imagen, DateTime timestamp)> _cache = new();
    private readonly TimeSpan _expiracion = TimeSpan.FromMinutes(5);
    private readonly ImagenProxy _proxyBase;
    
    public string Nombre => _proxyBase.Nombre;
    
    public ImagenProxyCache(string nombreArchivo) {
        _proxyBase = new ImagenProxy(nombreArchivo);
    }
    
    public void Mostrar() {
        if (_cache.TryGetValue(Nombre, out var entrada)) {
            if (DateTime.Now - entrada.timestamp < _expiracion) {
                Console.WriteLine($"[CACHE] Mostrando imagen: {Nombre}");
                return;
            }
        }
        
        _proxyBase.Mostrar();
        _cache[Nombre] = (_proxyBase, DateTime.Now);
    }
}

// Uso
Console.WriteLine("=== Virtual Proxy ===");
var imagenProxy = new ImagenProxy("foto1.jpg");
// Aquí no se carga la imagen todavía
Console.WriteLine("Proxy creado, imagen no cargada aún");
imagenProxy.Mostrar(); // Aquí se carga
imagenProxy.Mostrar(); // Ya está cargada

Console.WriteLine("\n=== Protection Proxy ===");
var imgAdmin = new ImagenProxyProtegida("secreta.jpg", "admin");
var imgUser = new ImagenProxyProtegida("secreta.jpg", "juan");
imgAdmin.Mostrar();
imgUser.Mostrar();
```

**Cuándo aplicar:**
- Creación diferida de objetos costosos (virtual proxy)
- Control de acceso basado en permisos (protection proxy)
- Objeto en ubicación remota (remote proxy)
- Logging, caching, validación adicional

---

### 3.8 Guía de Selección: Patrones Estructurales

| **Señal en tu código** | **Patrón sugerido** | **Pregunta clave** |
|-------------------------|---------------------|-------------------|
| Clases con interfaces incompatibles | Adapter | ¿Puedo introducir una capa de traducción? |
| Explosión de subclases por combinaciones | Bridge | ¿Existen dimensiones de variación independientes? |
| Jerarquía con recorrido recursivo | Composite | ¿Necesito tratar hojas y contenedores uniformemente? |
| Muchas subclases para extender funcionalidad | Decorator | ¿La funcionalidad puede aplicarse dinámicamente? |
| Subsistema complejo con múltiples clases | Facade | ¿Puedo simplificar la API para los casos frecuentes? |
| Miles de objetos con estado repetido | Flyweight | ¿Qué estado es compartido vs. único? |
| Objeto costoso o acceso controlado | Proxy | ¿Puedo diferir la creación o añadir control? |

---

## 4. Patrones de Comportamiento

Los patrones de comportamiento se centran en la asignación de responsabilidades entre objetos y en la comunicación entre ellos. Estos patrones describen cómo los objetos interactúan y cómo se distribuyen las responsabilidades.

### 4.1 Chain of Responsibility

**Intención:** Evitar acoplar el emisor de una solicitud con sus receptores, dando a más de un objeto la oportunidad de manejar la solicitud. Encadenar los receptores y pasar la solicitud a lo largo de la cadena hasta que un objeto la maneje.

**Problema que resuelve:** En muchos sistemas, una solicitud puede ser procesada por diferentes objetos dependiendo de condiciones que pueden variar. El código que envía la solicitud no debería conocer qué objeto específico la procesará, ni debería haber una dependencia directa hacia esos objetos.

**Estructura UML:**
```
 +---------+        +---------+        +---------+
 | Handler |<------| Handler |<------| Handler |
 +---------+        +---------+         +---------+
 |+SetNext()|       |+Handle()|         |+Handle() |
 +----+----+        +----+----+         +----+----+
      |                  |                   |
      v                  v                   v
  [Request]          [Request]           [Request]
```

**Implementación en C# - Sistema de aprobación de gastos:**

```csharp
// Manejador abstracto
public abstract class Aprobador {
    protected Aprobador? _siguiente;
    
    public Aprobador EstablecerSiguiente(Aprobador siguiente) {
        _siguiente = siguiente;
        return siguiente;
    }
    
    public abstract void Aprobar(SolicitudGasto solicitud);
    
    protected void PasarASiguiente(SolicitudGasto solicitud) {
        if (_siguiente != null) {
            _siguiente.Aprobar(solicitud);
        } else {
            Console.WriteLine("No hay más aprobadores en la cadena");
        }
    }
}

// Solicitud
public class SolicitudGasto {
    public string Descripcion { get; }
    public decimal Monto { get; }
    public string Solicitante { get; }
    public string? AprobadoPor { get; set; }
    public bool Aprobado { get; set; }
    
    public SolicitudGasto(string descripcion, decimal monto, string solicitante) {
        Descripcion = descripcion;
        Monto = monto;
        Solicitante = solicitante;
    }
}

// Manejadores concretos
public class Gerente extends Aprobador {
    public override void Aprobar(SolicitudGasto solicitud) {
        if (solicitud.Monto <= 10000) {
            Console.WriteLine($"Gerente aprobar gasto de {solicitud.Monto:C} por {solicitud.Solicitante}");
            solicitud.Aprobado = true;
            solicitud.AprobadoPor = "Gerente";
        } else {
            Console.WriteLine($"Gerente no puede aprobar, pasando a Director");
            PasarASiguiente(solicitud);
        }
    }
}

// Uso
var gerente = new Gerente();
var director = new Director();
var ceo = new CEO();

gerente.EstablecerSiguiente(director).EstablecerSiguiente(ceo);

// Simulacion
var solicitudes = new[] {
    new SolicitudGasto("Material oficina", 5000, "Ana"),
    new SolicitudGasto("Equipo computo", 25000, "Carlos"),
    new SolicitudGasto("Viaje internacional", 150000, "Maria"),
    new SolicitudGasto("Compra vehiculo", 80000000, "Pedro")
};

foreach (var sol in solicitudes) {
    Console.WriteLine($"\nSolicitud: {sol.Descripcion} - {sol.Monto:C}");
    gerente.Aprobar(sol);
    Console.WriteLine($"Resultado: {(sol.Aprobado ? "APROBADO" : "PENDIENTE")} por {sol.AprobadoPor}");
}
```

**Consideraciones:**
- La cadena puede ser estática o dinámica
- Asegurarse de que la cadena tenga un manejo por defecto
- El orden de los manejadores importa

**Cuándo aplicar:**
- Más de un objeto puede manejar una solicitud
- No quieres especificar explícitamente el receptor
- Los manejadores pueden cambiar dinámicamente

---

### 4.2 Command

**Intención:** Encapsular una solicitud como un objeto, permitiendo parametrizar clientes con diferentes solicitudes, encolar solicitudes y soportar operaciones de deshacer.

**Problema que resuelve:** Necesitas solicitar operaciones a objetos sin conocer los detalles de la operación ni su receptor. También necesitas deshacer operaciones o registrar el historial de acciones.

**Estructura UML:**
```
 +--------+      +--------+      +----------+
 | Client |<---->| Command|<---->| Receiver |
 +--------+      +--------+      +----------+
                  |+Execute()|    |+Action() |
                  |+Undo()   |    +----------+
                  +----+----+
                       |
                 +-----+-----+
                 |ConcreteC |
                 +----------+
                 |+Execute()|
                 +----------+
```

**Implementación en C#:**

```csharp
// Command interface
public interface IComando {
    void Ejecutar();
    void Deshacer();
}

// Receiver
public class EditorTexto {
    private string _contenido = "";
    
    public void Escribir(string texto) {
        _contenido += texto;
        Console.WriteLine($"Editor: '{texto}'");
    }
    
    public void Borrar(int caracteres) {
        if (caracteres > _contenido.Length) caracteres = _contenido.Length;
        var borrado = _contenido[^caracteres..];
        _contenido = _contenido[..^caracteres];
        Console.WriteLine($"Editor: Borrado '{borrado}'");
    }
    
    public string ObtenerContenido() => _contenido;
}

// Concrete Commands
public class ComandoEscribir : IComando {
    private readonly EditorTexto _editor;
    private readonly string _texto;
    
    public ComandoEscribir(EditorTexto editor, string texto) {
        _editor = editor;
        _texto = texto;
    }
    
    public void Ejecutar() => _editor.Escribir(_texto);
    public void Deshacer() => _editor.Borrar(_texto.Length);
}

public class ComandoReemplazar : IComando {
    private readonly EditorTexto _editor;
    private readonly string _textoAnterior;
    private readonly string _textoNuevo;
    
    public ComandoReemplazar(EditorTexto editor, string anterior, string nuevo) {
        _editor = editor;
        _textoAnterior = anterior;
        _textoNuevo = nuevo;
    }
    
    public void Ejecutar() {
        _editor.Borrar(_textoAnterior.Length);
        _editor.Escribir(_textoNuevo);
    }
    
    public void Deshacer() {
        _editor.Borrar(_textoNuevo.Length);
        _editor.Escribir(_textoAnterior);
    }
}

// Invoker con historial
public class BarraHerramientas {
    private readonly Stack<IComando> _historial = new();
    private readonly Stack<IComando> _deshacer = new();
    
    public void EjecutarComando(IComando comando) {
        comando.Ejecutar();
        _historial.Push(comando);
        _deshacer.Clear(); // Limpiamos redo al hacer nueva acción
    }
    
    public void Deshacer() {
        if (_historial.Count == 0) {
            Console.WriteLine("Nada que deshacer");
            return;
        }
        
        var comando = _historial.Pop();
        comando.Deshacer();
        _deshacer.Push(comando);
        Console.WriteLine("Deshacer ejecutado");
    }
    
    public void Rehacer() {
        if (_deshacer.Count == 0) {
            Console.WriteLine("Nada que rehacer");
            return;
        }
        
        var comando = _deshacer.Pop();
        comando.Ejecutar();
        _historial.Push(comando);
        Console.WriteLine("Rehacer ejecutado");
    }
}

// Uso
var editor = new EditorTexto();
var toolbar = new BarraHerramientas();

toolbar.EjecutarComando(new ComandoEscribir(editor, "Hola "));
toolbar.EjecutarComando(new ComandoEscribir(editor, "Mundo!"));
Console.WriteLine($"Contenido: {editor.ObtenerContenido()}");

toolbar.Deshacer();
Console.WriteLine($"Contenido después deshacer: {editor.ObtenerContenido()}");

toolbar.Rehacer();
Console.WriteLine($"Contenido después rehacer: {editor.ObtenerContenido()}");
```

**Variaciones:**
- **Macro Commands:** Ejecutar múltiples comandos como uno
- **Undo/Redo con Memento:** Combinar Command con Memento para estados complejos

**Cuándo aplicar:**
- Parametrizar objetos con acciones
- Especificar, encolar y ejecutar solicitudes en diferentes momentos
- Soportar deshacer
- Soportar logging y transacciones

---

### 4.3 Iterator

**Intención:** Proporcionar una forma de acceder secuencialmente a los elementos de una colección sin exponer su representación subyacente.

**Problema que resuelto:** Diferentes estructuras de datos necesitan ser recorridas de la misma manera. El código cliente no debería depender de la implementación interna de la colección. Además, diferentes tipos de recorrido (adelante, hacia atrás, profundidad primero) pueden ser necesarios.

**Estructura UML:**
```
 +--------+      +----------+
 | Client |<---->| Iterator  |
 +--------+      +----------+
                  |+First()  |
                  |+Next()   |
                  |+IsDone() |
                  |+Current()|
                  +----------+
                        ^
                        |
                +--------+--------+
                |ConcreteIterator |
                +-----------------+
```

**Nota:** C# ya implementa este patrón con IEnumerable<T>, IEnumerator<T>, y yield return.

**Implementación en C# - Iterador personalizado para árbol:**

```csharp
public class NodoArbol<T> {
    public T Valor { get; }
    public List<NodoArbol<T>> Hijos { get; } = new();
    public NodoArbol<T>? Padre { get; set; }
    
    public NodoArbol(T valor) {
        Valor = valor;
    }
}

public class IteradorArbolDFS<T> : IEnumerator<T> {
    private readonly Stack<NodoArbol<T>> _pila = new();
    private NodoArbol<T>? _actual;
    private T _current = default!;
    
    public T Current => _current;
    object IEnumerator.Current => _current;
    
    public IteradorArbolDFS(NodoArbol<T> raiz) {
        if (raiz != null) _pila.Push(raiz);
    }
    
    public bool MoveNext() {
        if (_pila.Count == 0) return false;
        
        _actual = _pila.Pop();
        _current = _actual.Valor;
        
        // Push hijos en orden inverso para recorrido left-to-right
        for (int i = _actual.Hijos.Count - 1; i >= 0; i--) {
            _pila.Push(_actual.Hijos[i]);
        }
        
        return true;
    }
    
    public void Reset() => throw new NotImplementedException();
    public void Dispose() { }
}

public class IteradorArbolBFS<T> : IEnumerator<T> {
    private readonly Queue<NodoArbol<T>> _cola = new();
    private T _current = default!;
    
    public T Current => _current;
    object IEnumerator.Current => _current;
    
    public IteradorArbolBFS(NodoArbol<T> raiz) {
        if (raiz != null) _cola.Enqueue(raiz);
    }
    
    public bool MoveNext() {
        if (_cola.Count == 0) return false;
        
        var nodo = _cola.Dequeue();
        _current = nodo.Valor;
        
        foreach (var hijo in nodo.Hijos) {
            _cola.Enqueue(hijo);
        }
        
        return true;
    }
    
    public void Reset() => throw new NotImplementedException();
    public void Dispose() { }
}

// Extension method para удобство
public static class ExtensionArbol {
    public static IEnumerable<T> RecorridoDFS<T>(this NodoArbol<T> raiz) {
        using var iter = new IteradorArbolDFS<T>(raiz);
        while (iter.MoveNext()) yield return iter.Current;
    }
    
    public static IEnumerable<T> RecorridoBFS<T>(this NodoArbol<T> raiz) {
        using var iter = new IteradorArbolBFS<T>(raiz);
        while (iter.MoveNext()) yield return iter.Current;
    }
}

// Uso
var raiz = new NodoArbol<string>("Raiz");
var nivel1A = new NodoArbol<string>("A");
var nivel1B = new NodoArbol<string>("B");
var nivel2A1 = new NodoArbol<string>("A1");
var nivel2A2 = new NodoArbol<string>("A2");
var nivel2B1 = new NodoArbol<string>("B1");

raiz.Hijos.Add(nivel1A);
raiz.Hijos.Add(nivel1B);
nivel1A.Hijos.Add(nivel2A1);
nivel1A.Hijos.Add(nivel2A2);
nivel1B.Hijos.Add(nivel2B1);

Console.WriteLine("DFS:");
foreach (var nodo in raiz.RecorridoDFS()) {
    Console.WriteLine($"  {nodo}");
}

Console.WriteLine("\nBFS:");
foreach (var nodo in raiz.RecorridoBFS()) {
    Console.WriteLine($"  {nodo}");
}
```

**Cuándo aplicar:**
- Proporcionar diferentes formas de recorrido sin exponer la estructura
- Iterar sobre colecciones polimórficas
- Necesitas un iterator específico (filters, transformations)

---

### 4.4 Mediator

**Intención:** Definir un objeto que encapsula cómo interactúa un conjunto de objetos. El Mediator promueve el acoplamiento flojo al evitar que los objetos se refieran directamente entre sí.

**Problema que resuelto:** Cuando múltiples objetos se comunican de forma compleja y directa, el código se vuelve difícil de mantener. Los objetos conocen demasiado sobre otros objetos y cualquier cambio tiene efectos en cascada.

**Estructura UML:**
```
 +----------+      +----------+
 |  Colleague|<----| Mediator |
 +----------+      +----------+
                   |+Notify() |
                   +----------+
                        ^
                        |
             +----------+----------+
             |                    |
        +----+----+          +----+----+
        |ConcreteM|          |ConcreteC|
        +---------+          +---------+
```

**Implementación en C# - Formulario de registro:**

```csharp
public interface IFormularioMediator {
    void Notificar(UIComponent componente, string evento);
}

public abstract class UIComponent {
    protected IFormularioMediator? _mediator;
    public string Id { get; }
    
    public UIComponent(string id) => Id = id;
    
    public void EstablecerMediator(IFormularioMediator mediator) {
        _mediator = mediator;
    }
    
    public abstract void HandleEvent(string evento);
    public abstract void CambiarEstado(bool habilitado);
}

// Concrete Colleagues
public class CampoEmail : UIComponent {
    public bool EsValido { get; private set; }
    private string _valor = "";
    
    public CampoEmail(string id) : base(id) { }
    
    public void SetValor(string valor) {
        _valor = valor;
        EsValido = valor.Contains("@");
        _mediator?.Notificar(this, "email_changed");
    }
    
    public override void CambiarEstado(bool habilitado) 
        => Console.WriteLine($"Campo Email: {(habilitado ? "Habilitado" : "Deshabilitado")}");
    
    public override void HandleEvent(string evento) { }
}

public class CheckBoxTerminos : UIComponent {
    public bool Marcado { get; private set; }
    
    public CheckBoxTerminos(string id) : base(id) { }
    
    public void Marcar(bool marcado) {
        Marcado = marcado;
        _mediator?.Notificar(this, "terminos_changed");
    }
    
    public override void CambiarEstado(bool habilitado)
        => Console.WriteLine($"Checkbox: {(habilitado ? "Habilitado" : "Deshabilitado")}");
    
    public override void HandleEvent(string evento) { }
}

public class BotonRegistro : UIComponent {
    private bool _habilitado;
    
    public BotonRegistro(string id) : base(id) { }
    
    public override void CambiarEstado(bool habilitado) {
        _habilitado = habilitado;
        Console.WriteLine($"Boton Registro: {(habilitado ? "HABILITADO" : "DESHABILITADO")}");
    }
    
    public void Click() {
        if (_habilitado) {
            Console.WriteLine("¡Registro procesado!");
            _mediator?.Notificar(this, "registro_clicked");
        }
    }
    
    public override void HandleEvent(string evento) { }
}

// Concrete Mediator
public class FormularioRegistroMediator : IFormularioMediator {
    private readonly CampoEmail _campoEmail;
    private readonly CheckBoxTerminos _checkTerminos;
    private readonly BotonRegistro _botonRegistro;
    
    public FormularioRegistroMediator(
        CampoEmail email, 
        CheckBoxTerminos checkTerminos,
        BotonRegistro boton) {
        
        _campoEmail = email;
        _checkTerminos = checkTerminos;
        _botonRegistro = boton;
        
        // Configurar mediador en componentes
        email.EstablecerMediator(this);
        checkTerminos.EstablecerMediator(this);
        boton.EstablecerMediator(this);
    }
    
    public void Notificar(UIComponent componente, string evento) {
        switch (evento) {
            case "email_changed":
                ActualizarBoton();
                break;
            case "terminos_changed":
                ActualizarBoton();
                break;
            case "registro_clicked":
                ProcesarRegistro();
                break;
        }
    }
    
    private void ActualizarBoton() {
        var puedeRegistrar = _campoEmail.EsValido && _checkTerminos.Marcado;
        _botonRegistro.CambiarEstado(puedeRegistrar);
    }
    
    private void ProcesarRegistro() {
        Console.WriteLine("Procesando registro...");
    }
}

// Uso
var email = new CampoEmail("email");
var terminos = new CheckBoxTerminos("terminos");
var boton = new BotonRegistro("registro");

var mediator = new FormularioRegistroMediator(email, terminos, boton);

// Simular interacciones del usuario
Console.WriteLine("=== Usuario escribe email inválido ===");
email.SetValor("correo-invalido");

Console.WriteLine("\n=== Usuario escribe email válido ===");
email.SetValor("correo@valido.com");

Console.WriteLine("\n=== Usuario acepta términos ===");
terminos.Marcar(true);

Console.WriteLine("\n=== Usuario hace click en registro ===");
boton.Click();
```

**Cuándo aplicar:**
- Un conjunto de objetos se comunica de forma compleja y bien definida
- Quieres personalizar el comportamiento sin subclases
- Un objeto frecuentemente referencia a otros muchos

---

### 4.5 Observer

**Intención:** Definir una dependencia de uno a muchos entre objetos, de modo que cuando un objeto cambia de estado, todos sus dependientes son notificados y actualizados automáticamente.

**Problema que resuelto:** Cuando un objeto necesita comunicar cambios a múltiples objetos sin coupled demasiado tightly. El sujeto no necesita conocer a sus observadores.

**Estructura UML:**
```
 +----------+ 1..* +----------+
 | Subject  |<---->| Observer  |
 +----------+      +----------+
 |+Attach() |      |+Update()  |
 |+Detach()|      +----------+
 |+Notify()|
 +----+----+
      |
      v
 +----+----+
 |Concrete|
 +--------+
```

**Implementación en C# - Sistema de notificaciones de bolsa:**

```csharp
// Observer interface
public interface IObservadorPrecio {
    void Actualizar(string simbolo, decimal precioAnterior, decimal precioNuevo);
}

// Subject
public class BolsaValores {
    private readonly List<IObservadorPrecio> _observadores = new();
    private readonly Dictionary<string, decimal> _precios = new();
    
    public void Suscribir(IObservadorPrecio observador) {
        _observadores.Add(observador);
        Console.WriteLine($"Nuevo suscriptor");
    }
    
    public void Desuscribir(IObservadorPrecio observador) {
        _observadores.Remove(observador);
    }
    
    public void ActualizarPrecio(string simbolo, decimal precio) {
        var precioAnterior = _precios.GetValueOrDefault(simbolo, 0);
        _precios[simbolo] = precio;
        
        // Notificar a todos los observadores
        foreach (var obs in _observadores) {
            obs.Actualizar(simbolo, precioAnterior, precio);
        }
    }
}

// Concrete Observers
public class InversorIndividual : IObservadorPrecio {
    private readonly string _nombre;
    
    public InversorIndividual(string nombre) => _nombre = nombre;
    
    public void Actualizar(string simbolo, decimal anterior, decimal nuevo) {
        var cambio = ((nuevo - anterior) / anterior) * 100;
        var direccion = cambio > 0 ? "↑" : "↓";
        Console.WriteLine($"[{_nombre}] {simbolo}: {anterior:C} -> {nuevo:C} ({direccion}{Math.Abs(cambio):F2}%)");
    }
}

public class RobotTrading : IObservadorPrecio {
    private readonly decimal _umbralCambio;
    
    public RobotTrading(decimal umbralCambio) => _umbralCambio = umbralCambio;
    
    public void Actualizar(string simbolo, decimal anterior, decimal nuevo) {
        var cambio = Math.Abs((nuevo - anterior) / anterior) * 100;
        
        if (cambio > _umbralCambio) {
            Console.WriteLine($"[Robot] Detectado cambio significativo en {simbolo}: {cambio:F2}% - Ejecutando operación");
            // Lógica de trading automático
        }
        else {
            Console.WriteLine($"[Robot] Cambio mínimo en {simbolo}: {cambio:F2}% - Sin acción");
        }
    }
}

public class PanelPantalla : IObservadorPrecio {
    public void Actualizar(string simbolo, decimal anterior, decimal nuevo) {
        Console.WriteLine($"[PANTALLA] {simbolo}: {nuevo:C}");
    }
}

// Uso
var bolsa = new BolsaValores();

var inversor1 = new InversorIndividual("Juan");
var inversor2 = new InversorIndividual("Maria");
var robot = new RobotTrading(5.0m); // 5% umbral
var pantalla = new PanelPantalla();

bolsa.Suscribir(inversor1);
bolsa.Suscribir(inversor2);
bolsa.Suscribir(robot);
bolsa.Suscribir(pantalla);

// Simular cambios de precios
Console.WriteLine("=== Actualización 1: AAPL sube ===");
bolsa.ActualizarPrecio("AAPL", 150.00m);

Console.WriteLine("\n=== Actualización 2: AAPL sube más ===");
bolsa.ActualizarPrecio("AAPL", 165.00m);
```

**Nota:** C# tiene soporte nativo para este patrón:
- Events y delegates
- IObservable<T>/IObserver<T> ( Reactive Extensions)
- INotifyPropertyChanged (para binding de UI)

---

### 4.6 State

**Intención:** Permitir que un objeto altere su comportamiento cuando su estado interno cambia. El objeto parecerá cambiar de clase.

**Problema que resuelto:** Cuando el comportamiento de un objeto depende de su estado, y el estado puede cambiar durante su vida útil. Evita grandes bloques de condicionales (switch/if) que son difíciles de mantener.

**Estructura UML:**
```
 +--------+      +--------+
 | Context|<---->| State  |
 +--------+      +--------+
 |+Request()|    |+Handle()|
 +--------+      +----+----+
                       ^
                       |
            +----------+----------+
            |                    |
       +----+----+         +----+----+
       |State A |         |State B   |
       +--------+         +----------+
```

**Implementación en C# - Máquina de estados de pedido:**

```csharp
public abstract class EstadoPedido {
    public abstract string Nombre { get; }
    public abstract void Pagar(Pedido contexto);
    public abstract void Enviar(Pedido contexto);
    public abstract void Entregar(Pedido contexto);
    public abstract void Cancelar(Pedido contexto);
}

public class Pedido {
    public string Id { get; }
    private EstadoPedido _estado;
    
    public string EstadoActual => _estado.Nombre;
    
    public Pedido(string id) {
        Id = id;
        _estado = new EstadoNuevo();
    }
    
    public void TransicionarA(EstadoPedido estado) {
        Console.WriteLine($"Pedido {Id}: {_estado.Nombre} -> {estado.Nombre}");
        _estado = estado;
    }
    
    public void Pagar() => _estado.Pagar(this);
    public void Enviar() => _estado.Enviar(this);
    public void Entregar() => _estado.Entregar(this);
    public void Cancelar() => _estado.Cancelar(this);
}

// Estados concretos
public class EstadoNuevo : EstadoPedido {
    public override string Nombre => "Nuevo";
    
    public override void Pagar(Pedido contexto) {
        contexto.TransicionarA(new EstadoPagado());
        Console.WriteLine("  -> Pago procesado");
    }
    
    public override void Enviar(Pedido contexto) 
        => Console.WriteLine("  -> Error: No se puede enviar sin pagar");
    
    public override void Entregar(Pedido contexto) 
        => Console.WriteLine("  -> Error: No se puede entregar sin enviar");
    
    public override void Cancelar(Pedido contexto) {
        contexto.TransicionarA(new EstadoCancelado());
        Console.WriteLine("  -> Pedido cancelado");
    }
}

public class EstadoPagado : EstadoPedido {
    public override string Nombre => "Pagado";
    
    public override void Pagar(Pedido contexto) 
        => Console.WriteLine("  -> Ya está pagado");
    
    public override void Enviar(Pedido contexto) {
        contexto.TransicionarA(new EstadoEnviado());
        Console.WriteLine("  -> Pedido enviado");
    }
    
    public override void Entregar(Pedido contexto) 
        => Console.WriteLine("  -> Error: No se puede entregar sin enviar");
    
    public override void Cancelar(Pedido contexto) {
        contexto.TransicionarA(new EstadoCancelado());
        Console.WriteLine("  -> Pedido cancelado, reembolso iniciado");
    }
}

public class EstadoEnviado : EstadoPedido {
    public override string Nombre => "Enviado";
    
    public override void Pagar(Pedido contexto) 
        => Console.WriteLine("  -> Ya está pagado");
    
    public override void Enviar(Pedido contexto) 
        => Console.WriteLine("  -> Ya fue enviado");
    
    public override void Entregar(Pedido contexto) {
        contexto.TransicionarA(new EstadoEntregado());
        Console.WriteLine("  -> Pedido entregado");
    }
    
    public override void Cancelar(Pedido contexto) 
        => Console.WriteLine("  -> Error: No se puede cancelar un pedido enviado");
}

public class EstadoEntregado : EstadoPedido {
    public override string Nombre => "Entregado";
    
    public override void Pagar(Pedido contexto) => Console.WriteLine("  -> Ya pagado");
    public override void Enviar(Pedido contexto) => Console.WriteLine("  -> Ya enviado");
    public override void Entregar(Pedido contexto) => Console.WriteLine("  -> Ya entregado");
    public override void Cancelar(Pedido contexto) => Console.WriteLine("  -> No se puede cancelar");
}

// Uso
var pedido = new Pedido("ORD-001");

Console.WriteLine($"Estado inicial: {pedido.EstadoActual}");
pedido.Pagar();
pedido.Enviar();
pedido.Entregar();
Console.WriteLine($"Estado final: {pedido.EstadoActual}");

Console.WriteLine("\n--- Otro pedido cancelado ---");
var pedido2 = new Pedido("ORD-002");
pedido2.Cancelar();
```

**State vs Strategy:**
- **State:** Las transiciones son controladas por el objeto mismo o por eventos internos
- **Strategy:** El cliente elige explícitamente qué estrategia usar

---

### 4.7 Strategy

**Intención:** Definir una familia de algoritmos, encapsular cada uno y hacerlos intercambiables. Strategy permite que el algoritmo varíe independientemente de los clientes que lo utilizan.

**Problema que resuelto:** Necesitas variar el comportamiento de un objeto en tiempo de ejecución sin modificar el código que lo usa. Diferentes situaciones requieren diferentes algoritmos.

**Estructura UML:**
```
 +---------+      +----------+
 | Context |<---->| Strategy |
 +---------+      +----------+
 |+Context()|     |+Execute()|
 +---------+      +----+-----+
                        ^
                        |
            +-----------+-----------+
            |                       |
       +----+----+            +----+----+
       | Str A  |            | Str B    |
       +--------+            +----------+
```

**Implementación en C# - Sistema de descuentos:**

```csharp
public interface IEstrategiaDescuento {
    decimal CalcularDescuento(decimal subtotal);
}

// Estrategias concretas
public class DescuentoPorcentaje : IEstrategiaDescuento {
    private readonly decimal _porcentaje;
    
    public DescuentoPorcentaje(decimal porcentaje) => _porcentaje = porcentaje;
    
    public decimal CalcularDescuento(decimal subtotal) {
        return subtotal * (_porcentaje / 100);
    }
}

public class DescuentoFijo : IEstrategiaDescuento {
    private readonly decimal _montoFijo;
    
    public DescuentoFijo(decimal montoFijo) => _montoFijo = montoFijo;
    
    public decimal CalcularDescuento(decimal subtotal) {
        return Math.Min(_montoFijo, subtotal);
    }
}

public class DescuentoCategoriaEspecial : IEstrategiaDescuento {
    private readonly HashSet<string> _categoriasPremium = new() { "Electronica", "Joyeria" };
    
    public decimal CalcularDescuento(decimal subtotal) {
        return subtotal * 0.15m; // 15% para categorías premium
    }
}

public class DescuentoPorCantidad : IEstrategiaDescuento {
    public decimal CalcularDescuento(decimal subtotal) {
        if (subtotal > 500000) return subtotal * 0.20m;
        if (subtotal > 200000) return subtotal * 0.10m;
        return 0;
    }
}

// Context
public class CarritoCompras {
    private IEstrategiaDescuento _estrategia;
    public List<(string producto, decimal precio, string categoria)> Items { get; } = new();
    
    public CarritoCompras(IEstrategiaDescuento estrategiaInicial) {
        _estrategia = estrategiaInicial;
    }
    
    public void CambiarEstrategia(IEstrategiaDescuento nuevaEstrategia) {
        _estrategia = nuevaEstrategia;
    }
    
    public decimal CalcularSubtotal() => Items.Sum(i => i.precio);
    
    public decimal CalcularDescuento() => _estrategia.CalcularDescuento(CalcularSubtotal());
    
    public decimal CalcularTotal() => CalcularSubtotal() - CalcularDescuento();
}

// Uso
var carrito = new CarritoCompras(new DescuentoPorcentaje(10));

carrito.Items.Add(("Laptop", 1500000, "Electronica"));
carrito.Items.Add(("Mouse", 50000, "Accesorios"));

Console.WriteLine($"Subtotal: {carrito.CalcularSubtotal():C}");
Console.WriteLine($"Descuento (10%): {carrito.CalcularDescuento():C}");
Console.WriteLine($"Total: {carrito.CalcularTotal():C}");

// Cambiar estrategia en tiempo de ejecución
carrito.CambiarEstrategia(new DescuentoPorCantidad());
Console.WriteLine($"\nCon estrategia por cantidad: {carrito.CalcularDescuento():C}");
```

---

### 4.8 Template Method

**Intención:** Definir el esqueleto de un algoritmo en una operación, delegando algunos pasos a las subclases. Template Method permite redefinir pasos sin cambiar la estructura del algoritmo.

**Problema que resuelto:**Tienes un algoritmo con una estructura común, pero algunos pasos varían entre implementaciones. La herencia permite compartir la estructura mientras se personalizan los detalles.

**Estructura UML:**
```
 +-----------------------+
 | AbstractClass         |
 +-----------------------+
 | +TemplateMethod()     |
 |  {Step1(); Step2();}  |
 +-----------------------+
 | +Step1() // abstract  |
 | +Step2() // virtual   |
 +-----------------------+
         ^
         |
 +-------+-------+
 |ConcreteClass    |
 +-----------------+
 | +Step1()        |
 +-----------------+
```

**Implementación en C# - Pipeline de datos:**

```csharp
public abstract class ProcesadorDatos {
    // Template Method - esqueleto del algoritmo
    public sealed void Procesar(string rutaArchivo) {
        var datos = LeerDatos(rutaArchivo);
        if (datos == null || datos.Count == 0) {
            Console.WriteLine("No hay datos para procesar");
            return;
        }
        
        if (!ValidarDatos(datos)) {
            Console.WriteLine("Validación fallida");
            return;
        }
        
        var transformados = Transformar(datos);
        var resultado = Calcular(transformados);
        ExportarResultado(resultado);
        
        Console.WriteLine("Procesamiento completado");
    }
    
    // Pasos abstractos - deben ser implementados por subclases
    protected abstract List<string> LeerDatos(string ruta);
    protected abstract bool ValidarDatos(List<string> datos);
    protected abstract List<decimal> Transformar(List<string> datos);
    protected abstract decimal Calcular(List<decimal> datos);
    
    // Paso virtual - puede ser sobrescrito pero tiene implementación por defecto
    protected virtual void ExportarResultado(decimal resultado) {
        Console.WriteLine($"Resultado: {resultado:C}");
    }
}

public class ProcesadorVentas : ProcesadorDatos {
    protected override List<string> LeerDatos(string ruta) {
        Console.WriteLine($"Leyendo archivo de ventas: {ruta}");
        return new List<string> { "100", "200", "150", "300" };
    }
    
    protected override bool ValidarDatos(List<string> datos) {
        Console.WriteLine("Validando datos de ventas...");
        return datos.All(d => decimal.TryParse(d, out _));
    }
    
    protected override List<decimal> Transformar(List<string> datos) {
        Console.WriteLine("Transformando a decimal...");
        return datos.Select(d => decimal.Parse(d)).ToList();
    }
    
    protected override decimal Calcular(List<decimal> datos) {
        Console.WriteLine("Calculando total de ventas...");
        return datos.Sum();
    }
}

public class ProcesadorInventario : ProcesadorDatos {
    protected override List<string> LeerDatos(string ruta) {
        Console.WriteLine($"Leyendo inventario: {ruta}");
        return new List<string> { "prod1:50", "prod2:30", "prod3:20" };
    }
    
    protected override bool ValidarDatos(List<string> datos) {
        Console.WriteLine("Validando formato de inventario...");
        return true; // simplificado
    }
    
    protected override List<decimal> Transformar(List<string> datos) {
        // Extraer cantidades
        return datos.Select(d => decimal.Parse(d.Split(':')[1])).ToList();
    }
    
    protected override decimal Calcular(List<decimal> datos) {
        return datos.Sum(); // Total de unidades en inventario
    }
    
    protected override void ExportarResultado(decimal resultado) {
        Console.WriteLine($"Inventario total: {resultado} unidades");
    }
}

// Uso
Console.WriteLine("=== Procesador de Ventas ===");
new ProcesadorVentas().Procesar("ventas.csv");

Console.WriteLine("\n=== Procesador de Inventario ===");
new ProcesadorInventario().Procesar("inventario.csv");
```

---

### 4.9 Visitor

**Intención:** Representar una operación que actúa sobre los elementos de una estructura de objetos. Visitor permite definir nuevas operaciones sin cambiar las clases de los elementos.

**Problema que resuelto:**Tienes una estructura de objetos estable pero necesitas añadir diferentes operaciones sobre ella. Sin Visitor, tendrías que modificar las clases de los elementos para cada nueva operación.

**Estructura UML:**
```
 +------------+       +----------+
 |   Visitor  |       |  Element |
 +------------+       +----------+
 |+Visit(A)   |<------|+Accept(V)|
 |+Visit(B)   |       +----------+
 +------------+            ^
       ^                  |
       |                  |
 +-----+-----+      +------+-----+
 |ConcreteV |      |ConcreteElem |
 +-----------+      +------------+
```

**Implementación en C# - Sistema de documentos:**

```csharp
public interface IDocumentoElemento {
    void Aceptar(IDocumentoVisitor visitor);
}

public interface IDocumentoVisitor {
    void Visitar(Parrafo parrafo);
    void Visitar(Imagen imagen);
    void Visitar(Seccion seccion);
}

// Elementos concretos
public class Parrafo : IDocumentoElemento {
    public string Contenido { get; }
    public int Palabras => Contenido.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
    
    public Parrafo(string contenido) => Contenido = contenido;
    
    public void Aceptar(IDocumentoVisitor visitor) => visitor.Visitar(this);
}

public class Imagen : IDocumentoElemento {
    public string Ruta { get; }
    public int TamanoBytes { get; }
    
    public Imagen(string ruta, int tamano) { Ruta = ruta; TamanoBytes = tamano; }
    
    public void Aceptar(IDocumentoVisitor visitor) => visitor.Visitar(this);
}

public class Seccion : IDocumentoElemento {
    public string Titulo { get; }
    public List<IDocumentoElemento> Hijos { get; } = new();
    
    public Seccion(string titulo) => Titulo = titulo;
    
    public void Agregar(IDocumentoElemento elemento) => Hijos.Add(elemento);
    
    public void Aceptar(IDocumentoVisitor visitor) => visitor.Visitar(this);
}

// Visitors concretos
public class ContadorEstadisticas : IDocumentoVisitor {
    public int TotalParrafos { get; private set; }
    public int TotalImagenes { get; private set; }
    public int TotalPalabras { get; private set; }
    public long TotalBytesImagenes { get; private set; }
    
    public void Visitar(Parrafo parrafo) {
        TotalParrafos++;
        TotalPalabras += parrafo.Palabras;
    }
    
    public void Visitar(Imagen imagen) {
        TotalImagenes++;
        TotalBytesImagenes += imagen.TamanoBytes;
    }
    
    public void Visitar(Seccion seccion) {
        foreach (var hijo in seccion.Hijos) {
            hijo.Aceptar(this);
        }
    }
}

public class ExportadorHTML : IDocumentoVisitor {
    private readonly StringBuilder _html = new();
    
    public string HTML => _html.ToString();
    
    public void Visitar(Parrafo parrafo) {
        _html.AppendLine($"<p>{parrafo.Contenido}</p>");
    }
    
    public void Visitar(Imagen imagen) {
        _html.AppendLine($"<img src=\"{imagen.Ruta}\" />");
    }
    
    public void Visitar(Seccion seccion) {
        _html.AppendLine($"<h2>{seccion.Titulo}</h2>");
        foreach (var hijo in seccion.Hijos) {
            hijo.Aceptar(this);
        }
    }
}

// Uso
var documento = new Seccion("Mi Documento");
documento.Agregar(new Parrafo("Este es un párrafo de ejemplo."));
documento.Agregar(new Imagen("foto.jpg", 50000));

var seccion2 = new Seccion("Sección 2");
seccion2.Agregar(new Parrafo("Otro párrafo con más contenido."));
documento.Agregar(seccion2);

//统计
var contador = new ContadorEstadisticas();
documento.Aceptar(contador);
Console.WriteLine($"Palabras: {contador.TotalPalabras}, Imágenes: {contador.TotalImagenes}");

// Exportar
var exporter = new ExportadorHTML();
documento.Aceptar(exporter);
Console.WriteLine(exporter.HTML);
```

**Consideraciones:**
- El patrón Visitor usa "double dispatch"
- La estructura de elementos debe ser relativamente estable
- Añadir nuevos elementos requiere actualizar todos los visitors

---

## 5. Principios SOLID y su Relación con los Patrones GoF

Los patrones de diseño GoF son materializaciones concretas de los principios SOLID:

| Principio | Descripción | Patrones que lo implementan |
|-----------|-------------|---------------------------|
| **SRP** (Responsabilidad Única) | Una clase debe tener una única razón para cambiar | Facade, Decorator, Proxy |
| **OCP** (Abierto/Cerrado) | Entidades de software deben estar abiertas para extensión pero cerradas para modificación | Strategy, Observer, Command, State, Template Method |
| **LSP** (Sustitución de Liskov) | Los objetos de una superclase deben poder ser reemplazados por objetos de una subclase sin alterar las propiedades del programa | Todos los patrones que usan polimorfismo |
| **ISP** (Segregación de Interfaces) | Los clientes no deben depender de interfaces que no usan | Iterator, Composite, Visitor |
| **DIP** (Inversión de Dependencias) | Los módulos de alto nivel no deben depender de módulos de bajo nivel | Abstract Factory, Adapter, Bridge, Strategy, Mediator |

---

## 6. Anti-Patrones Comunes

**Sobre-ingeniería con Singleton:** Usar Singleton para cualquier clase genera acoplamiento global y dificulta las pruebas unitarias. En proyectos .NET con DI, registra el servicio con lifetime Singleton.

**Adapter innecesario:** Si puedes modificar la interfaz del adaptee directamente, refactorízala. Adapter es para código que no controlas.

**Decorator infinito:** Encadenar demasiados decoradores hace que el código sea difícil de depurar. Si el pipeline supera los 5-6 niveles, considera refactorizar.

**Observer sobre-usado:** Si las notificaciones se retroalimentan (A notifica a B, B a C, C a A), terminas con ciclos infinitos. Diseña observadores idempotentes.

**Flyweight prematuro:** No optimices memoria antes de tener evidencia (profiling). Los objetos flyweight añaden complejidad por la separación de estado intrínseco/extrínseco.

**State vs Strategy confundido:** Si las transiciones son controladas externamente, usa Strategy. Si ocurren internamente en respuesta a eventos, usa State.

---

## 7. Refactorización Real: De Switch/If a Strategy

Vamos a ver un caso real de refactorización paso a paso. Imagina que trabajas en un e-commerce y tienes que calcular el costo de envío según la región y el tipo de suscripción del cliente.

### El Código "Antes" (Code Smell evidente)

```csharp
public class CalculadorEnvio
{
    public decimal CalcularCosto(string region, string tipoSuscripcion, decimal peso)
    {
        decimal costoBase = 0;
        
        // Primer code smell: switch encadenado
        switch (region)
        {
            case "Norte":
                costoBase = 10000;
                break;
            case "Sur":
                costoBase = 15000;
                break;
            case "Centro":
                costoBase = 8000;
                break;
            case "Costa":
                costoBase = 12000;
                break;
            default:
                costoBase = 20000;
                break;
        }
        
        // Segundo code smell: if anidados dentro del switch
        if (tipoSuscripcion == "Premium")
        {
            costoBase *= 0.5m; // 50% descuento
        }
        else if (tipoSuscripcion == "Plus")
        {
            costoBase *= 0.75m; // 25% descuento
        }
        // else: Sin descuento para estándar
        
        // Tercer code smell: otro if para peso extra
        if (peso > 5)
        {
            costoBase += (peso - 5) * 1000;
        }
        
        return costoBase;
    }
}

// Uso en otro lugar del código
public class CarritoCompra
{
    public decimal CalcularTotal(decimal subtotal, string region, string suscripcion, decimal peso)
    {
        var calculador = new CalculadorEnvio();
        var envio = calculador.CalcularCosto(region, suscripcion, peso);
        return subtotal + envio;
    }
}
```

### ¿Por qué esto es un problema?

1. **Viola OCP (Open/Closed Principle):** Cada vez que agregas una nueva región o tipo de suscripción, debes modificar este método.

2. **Viola SRP (Single Responsibility Principle):** Este método hace tres cosas diferentes: calcular costo base por región, aplicar descuento por suscripción, y adicionar costo por peso.

3. **Difícil de probar:** No puedes testear cada regla individualmente.

4. **Duplicación potencial:** Si necesitas esta lógica en otros lugares, terminas copiando el código o creando dependencias circulares.

### El Proceso de Refactorización

**Paso 1: Identificar las dimensiones de variación**

En este código vemos dos dimensiones que varían independientemente:
- La región geográfica (Norte, Sur, Centro, Costa)
- El tipo de suscripción (Premium, Plus, Estándar)

Esto es un indicador claro de que Strategy Pattern puede ayudar.

**Paso 2: Extraer la estrategia de descuento (la más simple)**

Primero, extraemos la lógica de descuentos porque es la más aislada.

```csharp
// Interfaz para la estrategia de descuento
public interface IEstrategiaDescuento
{
    decimal Aplicar(decimal costoBase);
}

// Estrategias concretas
public class DescuentoPremium : IEstrategiaDescuento
{
    public decimal Aplicar(decimal costoBase) => costoBase * 0.5m;
}

public class DescuentoPlus : IEstrategiaDescuento
{
    public decimal Aplicar(decimal costoBase) => costoBase * 0.75m;
}

public class SinDescuento : IEstrategiaDescuento
{
    public decimal Aplicar(decimal costoBase) => costoBase;
}
```

**Paso 3: Extraer la estrategia de región**

```csharp
public interface IEstrategiaRegion
{
    decimal ObtenerCostoBase();
}

public class RegionNorte : IEstrategiaRegion
{
    public decimal ObtenerCostoBase() => 10000m;
}

public class RegionSur : IEstrategiaRegion
{
    public decimal ObtenerCostoBase() => 15000m;
}

public class RegionCentro : IEstrategiaRegion
{
    public decimal ObtenerCostoBase() => 8000m;
}

public class RegionCosta : IEstrategiaRegion
{
    public decimal ObtenerCostoBase() => 12000m;
}

public class RegionDefault : IEstrategiaRegion
{
    public decimal ObtenerCostoBase() => 20000m;
}
```

**Paso 4: Refactorizar la clase principal**

```csharp
public class CalculadorEnvioRefactorizado
{
    private readonly IEstrategiaRegion _region;
    private readonly IEstrategiaDescuento _descuento;
    
    public CalculadorEnvioRefactorizado(
        IEstrategiaRegion region, 
        IEstrategiaDescuento descuento)
    {
        _region = region;
        _descuento = descuento;
    }
    
    public decimal CalcularCosto(decimal peso)
    {
        // Paso 1: Obtener costo base por región
        var costoBase = _region.ObtenerCostoBase();
        
        // Paso 2: Aplicar descuento por suscripción
        costoBase = _descuento.Aplicar(costoBase);
        
        // Paso 3: Aplicar cargo por peso adicional
        if (peso > 5)
        {
            costoBase += (peso - 5) * 1000;
        }
        
        return costoBase;
    }
}
```

**Paso 5: Crear una fábrica para construir la estrategia fácilmente**

```csharp
public class FabricaCalculadorEnvio
{
    public CalculadorEnvioRefactorizado Crear(string region, string suscripcion)
    {
        var estrategiaRegion = region switch
        {
            "Norte" => new RegionNorte(),
            "Sur" => new RegionSur(),
            "Centro" => new RegionCentro(),
            "Costa" => new RegionCosta(),
            _ => new RegionDefault()
        };
        
        var estrategiaDescuento = suscripcion switch
        {
            "Premium" => new DescuentoPremium(),
            "Plus" => new DescuentoPlus(),
            _ => new SinDescuento()
        };
        
        return new CalculadorEnvioRefactorizado(estrategiaRegion, estrategiaDescuento);
    }
}
```

### El Código "Después"

```csharp
// Uso simplificado
public class CarritoCompraRefactorizado
{
    private readonly FabricaCalculadorEnvio _fabrica = new();
    
    public decimal CalcularTotal(decimal subtotal, string region, string suscripcion, decimal peso)
    {
        var calculador = _fabrica.Crear(region, suscripcion);
        var envio = calculador.CalcularCosto(peso);
        return subtotal + envio;
    }
}

// Con inyección de dependencias (aún mejor)
public class ServicioCarrito
{
    private readonly Dictionary<(string region, string suscripcion), CalculadorEnvioRefactorizado> _cache;
    
    public ServicioCarrito()
    {
        _cache = new Dictionary<(string, string), CalculadorEnvioRefactorizado>();
    }
    
    public decimal CalcularEnvio(string region, string suscripcion, decimal peso)
    {
        var key = (region, suscripcion);
        
        if (!_cache.TryGetValue(key, out var calculador))
        {
            var fabrica = new FabricaCalculadorEnvio();
            calculador = fabrica.Crear(region, suscripcion);
            _cache[key] = calculador;
        }
        
        return calculador.CalcularCosto(peso);
    }
}
```

### Beneficios Obtenidos

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Agregar nueva región** | Modificar switch en el método principal | Crear nueva clase que implementa `IEstrategiaRegion` |
| **Agregar nueva suscripción** | Modificar ifs anidados | Crear nueva clase que implementa `IEstrategiaDescuento` |
| **Testing** | Difícil probar reglas aisladamente | Cada estrategia se testa independientemente |
| **Reutilización** | No posible | Las estrategias pueden reutilizarse en otros contextos |
| **OCP** | Violado | Cada estrategia es extensible sin modificar código existente |
| **SRP** | Violado | Cada clase hace una sola cosa |

### ¿Por qué Strategy y no State?

Una pregunta común es: "¿No sería mejor usar State aquí?". La diferencia clave:

- **Strategy:** El cliente elige explícitamente qué algoritmo usar (en este caso, el tipo de suscripción y región son seleccionados externamente, probablemente por configuración o base de datos).

- **State:** Las transiciones ocurren automáticamente en respuesta a eventos internos del objeto.

En nuestro caso, la selección de estrategia viene del exterior (parámetros de método), no de transiciones internas, así que **Strategy** es la elección correcta.

---

## 8. Refactorización Real: De Condicionales Encadenadas a Chain of Responsibility

Vamos a ver otro caso común: un sistema de validación donde múltiples reglas se aplican en secuencia. Imagina que trabajas en una plataforma de pagos y necesitas validar transacciones antes de procesarlas.

### El Código "Antes" (Code Smell evidente)

```csharp
public class ValidadorTransaccion
{
    public (bool valida, string error) Validar(Transaccion transaccion)
    {
        // Primer code smell: validaciones encadenadas en if/else
        if (transaccion.Monto <= 0)
        {
            return (false, "El monto debe ser mayor a cero");
        }
        
        if (transaccion.Monto > 10000000) // 10 millones
        {
            return (false, "El monto excede el límite máximo de 10 millones");
        }
        
        if (string.IsNullOrWhiteSpace(transaccion.NumeroTarjeta))
        {
            return (false, "El número de tarjeta es requerido");
        }
        
        if (transaccion.NumeroTarjeta.Length != 16)
        {
            return (false, "El número de tarjeta debe tener 16 dígitos");
        }
        
        if (!transaccion.NumeroTarjeta.All(char.IsDigit))
        {
            return (false, "El número de tarjeta debe contener solo dígitos");
        }
        
        if (transaccion.FechaExpiracion <= DateTime.Now)
        {
            return (false, "La tarjeta ha expirado");
        }
        
        if (transaccion.CVV.Length != 3 && transaccion.CVV.Length != 4)
        {
            return (false, "El CVV debe tener 3 o 4 dígitos");
        }
        
        if (transaccion.Titular.Length < 3)
        {
            return (false, "El nombre del titular es inválido");
        }
        
        // Si llegó hasta aquí, pasa todas las validaciones
        return (true, string.Empty);
    }
}

public class Transaccion
{
    public decimal Monto { get; set; }
    public string NumeroTarjeta { get; set; }
    public DateTime FechaExpiracion { get; set; }
    public string CVV { get; set; }
    public string Titular { get; set; }
    public string? Email { get; set; }
}
```

### ¿Por qué esto es un problema?

1. **Cada nueva validación requiere modificar el método:** El código crece y se vuelve inmanejable.

2. **Difícil de probar:** No puedes testear cada regla independientemente, ni saltarte reglas específicas para pruebas.

3. **Orden fijo:** No hay forma de cambiar el orden de las validaciones ni de activar/desactivar validaciones específicas.

4. **Viola OCP:** Cada vez que agregas una regla, debes modificar esta clase.

### El Proceso de Refactorización

**Paso 1: Definir la interfaz del manejador**

```csharp
public interface IManejadorValidacion
{
    (bool esValida, string? error) Validar(Transaccion transaccion);
    IManejadorValidacion EstablecerSiguiente(IManejadorValidacion siguiente);
}
```

**Paso 2: Crear la clase base abstracta**

```csharp
public abstract class ManejadorValidacionBase : IManejadorValidacion
{
    protected IManejadorValidacion? _siguiente;
    
    public virtual (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        // Por defecto, pasar al siguiente si existe
        if (_siguiente != null)
        {
            return _siguiente.Validar(transaccion);
        }
        
        // Si no hay siguiente, la validación pasa
        return (true, null);
    }
    
    public IManejadorValidacion EstablecerSiguiente(IManejadorValidacion siguiente)
    {
        _siguiente = siguiente;
        return siguiente;
    }
}
```

**Paso 3: Crear manejadores concretos para cada regla de validación**

```csharp
// Validar monto positivo
public class ValidadorMontoPositivo : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (transaccion.Monto <= 0)
        {
            return (false, "El monto debe ser mayor a cero");
        }
        
        Console.WriteLine("  ✓ Monto válido");
        return base.Validar(transaccion);
    }
}

// Validar monto máximo
public class ValidadorMontoMaximo : ManejadorValidacionBase
{
    private readonly decimal _montoMaximo;
    
    public ValidadorMontoMaximo(decimal montoMaximo = 10000000m)
    {
        _montoMaximo = montoMaximo;
    }
    
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (transaccion.Monto > _montoMaximo)
        {
            return (false, $"El monto excede el límite máximo de {_montoMaximo:C}");
        }
        
        Console.WriteLine("  ✓ Monto dentro del límite");
        return base.Validar(transaccion);
    }
}

// Validar número de tarjeta requerido
public class ValidadorTarjetaRequerida : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (string.IsNullOrWhiteSpace(transaccion.NumeroTarjeta))
        {
            return (false, "El número de tarjeta es requerido");
        }
        
        Console.WriteLine("  ✓ Tarjeta proporcionada");
        return base.Validar(transaccion);
    }
}

// Validar longitud de tarjeta
public class ValidadorLongitudTarjeta : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (transaccion.NumeroTarjeta.Length != 16)
        {
            return (false, "El número de tarjeta debe tener 16 dígitos");
        }
        
        Console.WriteLine("  ✓ Longitud de tarjeta válida");
        return base.Validar(transaccion);
    }
}

// Validar que solo contenga dígitos
public class ValidadorSoloDigitos : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (!transaccion.NumeroTarjeta.All(char.IsDigit))
        {
            return (false, "El número de tarjeta debe contener solo dígitos");
        }
        
        Console.WriteLine("  ✓ Solo dígitos en tarjeta");
        return base.Validar(transaccion);
    }
}

// Validar fecha de expiración
public class ValidadorFechaExpiracion : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (transaccion.FechaExpiracion <= DateTime.Now)
        {
            return (false, "La tarjeta ha expirado");
        }
        
        Console.WriteLine("  ✓ Tarjeta vigente");
        return base.Validar(transaccion);
    }
}

// Validar CVV
public class ValidadorCVV : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (transaccion.CVV.Length != 3 && transaccion.CVV.Length != 4)
        {
            return (false, "El CVV debe tener 3 o 4 dígitos");
        }
        
        Console.WriteLine("  ✓ CVV válido");
        return base.Validar(transaccion);
    }
}

// Validar nombre del titular
public class ValidadorTitular : ManejadorValidacionBase
{
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        if (transaccion.Titular.Length < 3)
        {
            return (false, "El nombre del titular es inválido");
        }
        
        Console.WriteLine("  ✓ Titular válido");
        return base.Validar(transaccion);
    }
}
```

**Paso 4: Crear una fábrica para configurar la cadena**

```csharp
public class FabricaValidadorTransaccion
{
    public IManejadorValidacion CrearCadenaCompleta()
    {
        var cadena = new ValidadorMontoPositivo();
        cadena.EstablecerSiguiente(new ValidadorMontoMaximo())
              .EstablecerSiguiente(new ValidadorTarjetaRequerida())
              .EstablecerSiguiente(new ValidadorLongitudTarjeta())
              .EstablecerSiguiente(new ValidadorSoloDigitos())
              .EstablecerSiguiente(new ValidadorFechaExpiracion())
              .EstablecerSiguiente(new ValidadorCVV())
              .EstablecerSiguiente(new ValidadorTitular());
        
        return cadena;
    }
    
    public IManejadorValidacion CrearCadenaSimple()
    {
        // Cadena mínima para pruebas o transacciones de bajo riesgo
        var cadena = new ValidadorMontoPositivo();
        cadena.EstablecerSiguiente(new ValidadorTarjetaRequerida())
              .EstablecerSiguiente(new ValidadorLongitudTarjeta());
        
        return cadena;
    }
    
    public IManejadorValidacion CrearCadenaPersonalizada(
        bool validarMontoMaximo = true,
        bool validarSoloDigitos = true,
        bool validarExpiracion = true,
        bool validarCVV = true,
        bool validarTitular = true)
    {
        var cadena = new ValidadorMontoPositivo();
        
        if (validarMontoMaximo)
            cadena.EstablecerSiguiente(new ValidadorMontoMaximo());
        
        cadena.EstablecerSiguiente(new ValidadorTarjetaRequerida())
              .EstablecerSiguiente(new ValidadorLongitudTarjeta());
        
        if (validarSoloDigitos)
            cadena.EstablecerSiguiente(new ValidadorSoloDigitos());
        
        if (validarExpiracion)
            cadena.EstablecerSiguiente(new ValidadorFechaExpiracion());
        
        if (validarCVV)
            cadena.EstablecerSiguiente(new ValidadorCVV());
        
        if (validarTitular)
            cadena.EstablecerSiguiente(new ValidadorTitular());
        
        return cadena;
    }
}
```

### El Código "Después"

```csharp
public class ValidadorTransaccionRefactorizado
{
    private readonly IManejadorValidacion _cadena;
    
    public ValidadorTransaccionRefactorizado(IManejadorValidacion cadena)
    {
        _cadena = cadena;
    }
    
    public (bool valida, string error) Validar(Transaccion transaccion)
    {
        var resultado = _cadena.Validar(transaccion);
        return resultado;
    }
}

// Uso en el servicio de pagos
public class ServicioPagos
{
    private readonly FabricaValidadorTransaccion _fabrica = new();
    
    public ResultadoProcesamiento ProcesarPago(Transaccion transaccion)
    {
        // Usar cadena completa para transacciones normales
        var validador = new ValidadorTransaccionRefactorizado(
            _fabrica.CrearCadenaCompleta()
        );
        
        var (esValida, error) = validador.Validar(transaccion);
        
        if (!esValida)
        {
            return new ResultadoProcesamiento 
            { 
                Exito = false, 
                Mensaje = error 
            };
        }
        
        // Aquí iría la lógica de procesamiento real
        return new ResultadoProcesamiento 
        { 
            Exito = true, 
            Mensaje = "Transacción procesada exitosamente" 
        };
    }
}

// Demo
class Program
{
    static void Main()
    {
        var fabrica = new FabricaValidadorTransaccion();
        var validador = new ValidadorTransaccionRefactorizado(
            fabrica.CrearCadenaCompleta()
        );
        
        var transaccionValida = new Transaccion
        {
            Monto = 50000m,
            NumeroTarjeta = "4532123456789012",
            FechaExpiracion = DateTime.Now.AddYears(2),
            CVV = "123",
            Titular = "Juan Pérez"
        };
        
        var transaccionInvalida = new Transaccion
        {
            Monto = -1000m,
            NumeroTarjeta = "123",
            FechaExpiracion = DateTime.Now.AddYears(-1),
            CVV = "1",
            Titular = "AB"
        };
        
        Console.WriteLine("=== Transacción Válida ===");
        var (valida1, error1) = validador.Validar(transaccionValida);
        Console.WriteLine($"Resultado: {(valida1 ? "VÁLIDA" : "INVÁLIDA")} - {error1}");
        
        Console.WriteLine("\n=== Transacción Inválida ===");
        var (valida2, error2) = validador.Validar(transaccionInvalida);
        Console.WriteLine($"Resultado: {(valida2 ? "VÁLIDA" : "INVÁLIDA")} - {error2}");
    }
}
```

### Beneficios Obtenidos

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Agregar nueva validación** | Modificar método huge | Crear nueva clase que implementa `IManejadorValidacion` |
| **Testing** | Difícil probar reglas aisladamente | Cada manejador se testa independientemente |
| **Orden de validaciones** | Fijo, no configurable | Configurable mediante la fábrica |
| **Desactivar reglas** | Imposible | Fácil mediante fábrica personalizada |
| **OCP** | Violado | Cada manejador es extensible sin modificar código existente |
| **Reutilización** | No posible | Los manejadores pueden reutilizarse en otros flujos |
| **Debugging** | Difícil saber qué validación falló | Cada manejador imprime su resultado |

### ¿Por qué Chain of Responsibility y no Strategy?

- **Chain of Responsibility:** Cada manejador decide si procesar la solicitud o pasarla al siguiente. El orden importa y cada manejador puede decidir si continuar o no.

- **Strategy:** Todos los algoritmos se ejecutan y se combinan sus resultados. El orden no importa normalmente.

En nuestro caso de validaciones:
- Cada validación debe ejecutarse solo si la anterior pasó (orden matters)
- Cuando una validación falla, no tiene sentido continuar
- Cada manejador tiene la responsabilidad de decidir si pasar al siguiente

Esto hace que **Chain of Responsibility** sea la elección correcta.

### Bonus: Agregar logging y métricas sin modificar la cadena

Puedes agregar un manejador decorador para logging sin modificar las validaciones existentes:

```csharp
public class ValidadorConLogging : ManejadorValidacionBase
{
    private readonly IManejadorValidacion _siguiente;
    
    public ValidadorConLogging(IManejadorValidacion siguiente)
    {
        _siguiente = siguiente;
    }
    
    public override (bool esValida, string? error) Validar(Transaccion transaccion)
    {
        var inicio = DateTime.Now;
        
        Console.WriteLine($"[LOG] Iniciando validación de transacción: {transaccion.Monto:C}");
        
        var resultado = _siguiente.Validar(transaccion);
        
        var duracion = DateTime.Now - inicio;
        Console.WriteLine($"[LOG] Validación completada en {duracion.TotalMilliseconds}ms - " +
                         $"Resultado: {(resultado.esValida ? "EXITOSA" : "FALLIDA")}");
        
        return resultado;
    }
}

// Uso
var cadena = new ValidadorMontoPositivo();
cadena.EstablecerSiguiente(new ValidadorConLogging(new ValidadorTarjetaRequerida()));
```

---

## 9. Refactorización Real: De Métodos Auxiliary a Decorator

Vamos a ver un caso muy común: necesitas agregar funcionalidad transversal como logging, caching, validación, medición de tiempo, etc. a tus servicios sin modificar su código.

Imagina que tienes un servicio de productos y necesitas agregar logging, caché y validación sin ensuciar la lógica de negocio.

### El Código "Antes" (Code Smell evidente)

```csharp
public class ServicioProductos
{
    private readonly Dictionary<int, Producto> _productos = new();
    
    public ServicioProductos()
    {
        // Datos de ejemplo
        _productos[1] = new Producto(1, "Laptop", 1500000m);
        _productos[2] = new Producto(2, "Mouse", 50000m);
    }
    
    public Producto? ObtenerPorId(int id)
    {
        // Code smell: logging mezclado con lógica de negocio
        Console.WriteLine($"[LOG] Obteniendo producto {id}");
        
        // Code smell: validación mezclada
        if (id <= 0)
        {
            Console.WriteLine("[LOG] ID inválido");
            return null;
        }
        
        // Code smell: caché mezclado
        var cacheKey = $"producto_{id}";
        if (_cache.TryGetValue(cacheKey, out var cached))
        {
            Console.WriteLine("[CACHE] Devolviendo desde caché");
            return cached;
        }
        
        // Lógica real
        if (_productos.TryGetValue(id, out var producto))
        {
            Console.WriteLine("[LOG] Producto encontrado");
            _cache[cacheKey] = producto;
            return producto;
        }
        
        Console.WriteLine("[LOG] Producto no encontrado");
        return null;
    }
    
    public List<Producto> ObtenerTodos()
    {
        Console.WriteLine("[LOG] Obteniendo todos los productos");
        
        if (_todosCache != null)
        {
            Console.WriteLine("[CACHE] Devolviendo lista desde caché");
            return _todosCache;
        }
        
        var productos = _productos.Values.ToList();
        _todosCache = productos;
        return productos;
    }
    
    public void Guardar(Producto producto)
    {
        Console.WriteLine($"[LOG] Guardando producto {producto.Id}");
        
        if (producto == null)
            throw new ArgumentNullException(nameof(producto));
        
        if (string.IsNullOrWhiteSpace(producto.Nombre))
            throw new ArgumentException("El nombre es requerido");
        
        if (producto.Precio < 0)
            throw new ArgumentException("El precio no puede ser negativo");
        
        _productos[producto.Id] = producto;
        
        // Invalidar caché
        _cache.Clear();
        _todosCache = null;
    }
    
    // Code smell: campos mezclados con lógica de negocio
    private readonly Dictionary<string, object> _cache = new();
    private List<Producto>? _todosCache;
}

public class Producto
{
    public int Id { get; set; }
    public string Nombre { get; set; }
    public decimal Precio { get; set; }
    
    public Producto(int id, string nombre, decimal precio)
    {
        Id = id;
        Nombre = nombre;
        Precio = precio;
    }
}
```

### ¿Por qué esto es un problema?

1. **Viola SRP:** La clase hace muchas cosas: lógica de negocio, logging, validación, caché.

2. **Difícil de probar:** No puedes testear la lógica de negocio sin el logging.

3. **Duplicación:** Si necesitas las mismas funcionalidades en otros servicios, terminas copiando código.

4. **Acoplamiento:** Cada servicio está coupled con la implementación de logging, caché, etc.

5. **Imposible combinar funcionalidades selectivamente:** No puedes tener logging sin caché.

### El Proceso de Refactorización

**Paso 1: Definir la interfaz del componente**

```csharp
public interface IServicioProductos
{
    Producto? ObtenerPorId(int id);
    List<Producto> ObtenerTodos();
    void Guardar(Producto producto);
}
```

**Paso 2: Crear el componente concreto (lógica de negocio pura)**

```csharp
public class ServicioProductosCore : IServicioProductos
{
    private readonly Dictionary<int, Producto> _productos = new();
    
    public ServicioProductosCore()
    {
        _productos[1] = new Producto(1, "Laptop", 1500000m);
        _productos[2] = new Producto(2, "Mouse", 50000m);
    }
    
    public Producto? ObtenerPorId(int id)
    {
        return _productos.TryGetValue(id, out var producto) ? producto : null;
    }
    
    public List<Producto> ObtenerTodos()
    {
        return _productos.Values.ToList();
    }
    
    public void Guardar(Producto producto)
    {
        _productos[producto.Id] = producto;
    }
}
```

**Paso 3: Crear la clase base decoradora**

```csharp
public abstract class DecoradorServiciosProductos : IServicioProductos
{
    protected readonly IServicioProductos _anterior;
    
    protected DecoradorServiciosProductos(IServicioProductos anterior)
    {
        _anterior = anterior;
    }
    
    public virtual Producto? ObtenerPorId(int id)
    {
        return _anterior.ObtenerPorId(id);
    }
    
    public virtual List<Producto> ObtenerTodos()
    {
        return _anterior.ObtenerTodos();
    }
    
    public virtual void Guardar(Producto producto)
    {
        _anterior.Guardar(producto);
    }
}
```

**Paso 4: Crear decoradores concretos**

```csharp
// Decorador de Logging
public class DecoradorLogging : DecoradorServiciosProductos
{
    public DecoradorLogging(IServicioProductos anterior) : base(anterior) { }
    
    public override Producto? ObtenerPorId(int id)
    {
        Console.WriteLine($"[LOG] Obteniendo producto {id}");
        var resultado = base.ObtenerPorId(id);
        Console.WriteLine($"[LOG] Resultado: {(resultado != null ? "Encontrado" : "No encontrado")}");
        return resultado;
    }
    
    public override List<Producto> ObtenerTodos()
    {
        Console.WriteLine("[LOG] Obteniendo todos los productos");
        return base.ObtenerTodos();
    }
    
    public override void Guardar(Producto producto)
    {
        Console.WriteLine($"[LOG] Guardando producto {producto.Id} - {producto.Nombre}");
        base.Guardar(producto);
        Console.WriteLine("[LOG] Guardado completado");
    }
}

// Decorador de Caché
public class DecoradorCache : DecoradorServiciosProductos
{
    private readonly Dictionary<string, (object? valor, DateTime expires)> _cache = new();
    private readonly TimeSpan _expiracion;
    
    public DecoradorCache(IServicioProductos anterior, TimeSpan? expiracion = null) 
        : base(anterior) 
    {
        _expiracion = expiracion ?? TimeSpan.FromMinutes(5);
    }
    
    public override Producto? ObtenerPorId(int id)
    {
        var key = $"producto_{id}";
        
        if (_cache.TryGetValue(key, out var entrada) && entrada.expires > DateTime.Now)
        {
            Console.WriteLine("[CACHE] Obtenido desde caché");
            return (Producto?)entrada.valor;
        }
        
        var resultado = base.ObtenerPorId(id);
        if (resultado != null)
        {
            _cache[key] = (resultado, DateTime.Now.Add(_expiracion));
            Console.WriteLine("[CACHE] Guardado en caché");
        }
        
        return resultado;
    }
    
    public override List<Producto> ObtenerTodos()
    {
        var key = "todos_productos";
        
        if (_cache.TryGetValue(key, out var entrada) && entrada.expires > DateTime.Now)
        {
            Console.WriteLine("[CACHE] Lista obtenida desde caché");
            return (List<Producto>?)entrada.valor ?? new List<Producto>();
        }
        
        var resultado = base.ObtenerTodos();
        _cache[key] = (resultado, DateTime.Now.Add(_expiracion));
        return resultado;
    }
    
    public override void Guardar(Producto producto)
    {
        base.Guardar(producto);
        
        // Invalidar caché
        _cache.Clear();
        Console.WriteLine("[CACHE] Caché invalidado");
    }
}

// Decorador de Validación
public class DecoradorValidacion : DecoradorServiciosProductos
{
    public DecoradorValidacion(IServicioProductos anterior) : base(anterior) { }
    
    public override Producto? ObtenerPorId(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException("El ID debe ser mayor a cero", nameof(id));
        }
        
        return base.ObtenerPorId(id);
    }
    
    public override void Guardar(Producto producto)
    {
        if (producto == null)
        {
            throw new ArgumentNullException(nameof(producto));
        }
        
        if (string.IsNullOrWhiteSpace(producto.Nombre))
        {
            throw new ArgumentException("El nombre es requerido", nameof(producto));
        }
        
        if (producto.Precio < 0)
        {
            throw new ArgumentException("El precio no puede ser negativo", nameof(producto));
        }
        
        base.Guardar(producto);
    }
}

// Decorador de Medición de Tiempo
public class DecoradorMedicionTiempo : DecoradorServiciosProductos
{
    public DecoradorMedicionTiempo(IServicioProductos anterior) : base(anterior) { }
    
    public override Producto? ObtenerPorId(int id)
    {
        var inicio = DateTime.Now;
        var resultado = base.ObtenerPorId(id);
        var duracion = DateTime.Now - inicio;
        
        Console.WriteLine($"[TIEMPO] ObtenerPorId({id}) completó en {duracion.TotalMilliseconds:F2}ms");
        return resultado;
    }
    
    public override List<Producto> ObtenerTodos()
    {
        var inicio = DateTime.Now;
        var resultado = base.ObtenerTodos();
        var duracion = DateTime.Now - inicio;
        
        Console.WriteLine($"[TIEMPO] ObtenerTodos() completó en {duracion.TotalMilliseconds:F2}ms");
        return resultado;
    }
}
```

**Paso 5: Construir el pipeline según necesidad**

```csharp
public class FabricaServiciosProductos
{
    public IServicioProductos CrearServicioCompleto()
    {
        // Orden importante: primero validación, luego logging, luego caché, luego tiempo
        var servicio = new ServicioProductosCore();
        servicio = new DecoradorValidacion(servicio);
        servicio = new DecoradorLogging(servicio);
        servicio = new DecoradorCache(servicio);
        servicio = new DecoradorMedicionTiempo(servicio);
        
        return servicio;
    }
    
    public IServicioProductos CrearServicioParaTesting()
    {
        // Sin efectos secundarios para testing
        return new ServicioProductosCore();
    }
    
    public IServicioProductos CrearServicioConLoggingYCache()
    {
        var servicio = new ServicioProductosCore();
        servicio = new DecoradorLogging(servicio);
        servicio = new DecoradorCache(servicio);
        return servicio;
    }
}
```

### El Código "Después"

```csharp
// Uso simple
class Program
{
    static void Main()
    {
        var fabrica = new FabricaServiciosProductos();
        
        Console.WriteLine("=== Servicio Completo ===");
        var servicioCompleto = fabrica.CrearServicioCompleto();
        
        var producto = servicioCompleto.ObtenerPorId(1);
        Console.WriteLine($"Producto: {producto?.Nombre} - {producto?.Precio:C}");
        
        var productos = servicioCompleto.ObtenerTodos();
        Console.WriteLine($"Total productos: {productos.Count}");
        
        Console.WriteLine("\n=== Servicio con Logging y Cache ===");
        var servicioParcial = fabrica.CrearServicioConLoggingYCache();
        
        var p1 = servicioParcial.ObtenerPorId(1); // Primera llamada - sin cache
        var p2 = servicioParcial.ObtenerPorId(1); // Segunda llamada - desde cache
        
        Console.WriteLine("\n=== Guardar producto ===");
        servicioCompleto.Guardar(new Producto(3, "Teclado", 80000m));
        
        Console.WriteLine("\n=== Intentar invalidar ID ===");
        try
        {
            servicioCompleto.ObtenerPorId(-1);
        }
        catch (ArgumentException ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
        }
    }
}
```

### Beneficios Obtenidos

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Agregar logging** | Modificar clase existente | Agregar DecoradorLogging |
| **Agregar caché** | Modificar clase existente | Agregar DecoradorCache |
| **Agregar validación** | Mezclar con lógica | Agregar DecoradorValidacion |
| **Testing** | Difícil por efectos secundarios | Cada decorador se testa independientemente |
| **Combinar funcionalidades** | No posible | Configurable mediante fábrica |
| **Orden de ejecución** | Fijo | Configurable |
| **SRP** | Violado | Cada decorador tiene una responsabilidad |
| **OCP** | Violado | Añadir decoradores sin modificar código existente |

### ¿Por qué Decorator y no otros patrones?

- **Decorator vs Proxy:** Ambos envuelven objetos, pero Proxy controla el acceso (autenticación, remoting), mientras Decorator añade comportamiento dinámicamente.

- **Decorator vs Chain of Responsibility:** Chain pasa la solicitud a través de una cadena donde cada eslabón decide si continuar. Decorator pasa la solicitud a través de capas que añaden comportamiento ythen pasan al siguiente.

- **Decorator vs inheritance:** Inheritance añade comportamiento estáticamente (en tiempo de compilación). Decorator lo hace dinámicamente (en tiempo de ejecución).

En este caso, cada funcionalidad (logging, caché, validación) es ortogonal y debe poder combinarse independientemente, lo que hace a **Decorator** la elección perfecta.

---

## 10. Refactorización Real: De Switch/Case a State

Vamos a ver otro caso muy común: sistemas con múltiples estados donde el comportamiento cambia según el estado actual. Imagina un sistema de préstamos de biblioteca.

### El Código "Antes" (Code Smell evidente)

```csharp
public class Prestamo
{
    public int Id { get; set; }
    public string Libro { get; set; }
    public string Usuario { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaDevolucion { get; set; }
    public string Estado { get; set; } // "Pendiente", "Aprobado", "Rechazado", "Activo", "Devuelto", "Vencido"
    public DateTime? FechaVencimiento { get; set; }
}

public class GestorPrestamos
{
    public void Aprobar(Prestamo prestamo)
    {
        if (prestamo.Estado != "Pendiente")
        {
            Console.WriteLine("Solo se pueden aprobar préstamos pendientes");
            return;
        }
        
        prestamo.Estado = "Aprobado";
        prestamo.FechaVencimiento = DateTime.Now.AddDays(14);
        Console.WriteLine($"Préstamo aprobado, vence el {prestamo.FechaVencimiento:dd/MM/yyyy}");
    }
    
    public void Rechazar(Prestamo prestamo, string motivo)
    {
        if (prestamo.Estado != "Pendiente")
        {
            Console.WriteLine("Solo se pueden rechazar préstamos pendientes");
            return;
        }
        
        prestamo.Estado = "Rechazado";
        Console.WriteLine($"Préstamo rechazado: {motivo}");
    }
    
    public void Activar(Prestamo prestamo)
    {
        if (prestamo.Estado != "Aprobado")
        {
            Console.WriteLine("Solo se pueden activar préstamos aprobados");
            return;
        }
        
        prestamo.Estado = "Activo";
        Console.WriteLine("Préstamo activado, libro prestado");
    }
    
    public void Devolver(Prestamo prestamo)
    {
        // Code smell: switch dentro de cada método
        switch (prestamo.Estado)
        {
            case "Activo":
                prestamo.Estado = "Devuelto";
                prestamo.FechaDevolucion = DateTime.Now;
                Console.WriteLine("Libro devuelto exitosamente");
                break;
            case "Vencido":
                prestamo.Estado = "Devuelto";
                prestamo.FechaDevolucion = DateTime.Now;
                Console.WriteLine("Libro devuelto con retraso");
                break;
            default:
                Console.WriteLine($"No se puede devolver un préstamo en estado: {prestamo.Estado}");
                break;
        }
    }
    
    public void MarcarVencido(Prestamo prestamo)
    {
        if (prestamo.Estado == "Activo" && prestamo.FechaVencimiento < DateTime.Now)
        {
            prestamo.Estado = "Vencido";
            Console.WriteLine("Préstamo marcado como vencido");
        }
    }
    
    public string ObtenerDescripcionEstado(Prestamo prestamo)
    {
        // Code smell: otro switch para el mismo estado
        return prestamo.Estado switch
        {
            "Pendiente" => "Esperando aprobación",
            "Aprobado" => $"Aprobado, vence el {prestamo.FechaVencimiento:dd/MM/yyyy}",
            "Rechazado" => "Rechazado por el sistema",
            "Activo" => $"Activo, vence el {prestamo.FechaVencimiento:dd/MM/yyyy}",
            "Devuelto" => $"Devuelto el {prestamo.FechaDevolucion:dd/MM/yyyy}",
            "Vencido" => "Vencido, requiere atención",
            _ => "Estado desconocido"
        };
    }
}
```

### ¿Por qué esto es un problema?

1. **Viola OCP:** Cada vez que agregas un nuevo estado, debes modificar todos los métodos.

2. **Viola SRP:** Los métodos contienen lógica de múltiples estados.

3. **Difícil de mantener:** El código de un estado está disperso en múltiples métodos.

4. **Transiciones inválidas no se detectan:** Puedes activar un préstamo ya devuelto sin errores claros.

5. **Testing difícil:** No puedes probar el comportamiento de un estado sin manipular el string.

### El Proceso de Refactorización

**Paso 1: Definir la interfaz de estado**

```csharp
public interface IEstadoPrestamo
{
    string Nombre { get; }
    void Aprobar(Prestamo prestamo);
    void Rechazar(Prestamo prestamo, string motivo);
    void Activar(Prestamo prestamo);
    void Devolver(Prestamo prestamo);
    void MarcarVencido(Prestamo prestamo);
    string ObtenerDescripcion(Prestamo prestamo);
}
```

**Paso 2: Crear clase base con comportamiento por defecto**

```csharp
public abstract class EstadoPrestamoBase : IEstadoPrestamo
{
    public abstract string Nombre { get; }
    
    public virtual void Aprobar(Prestamo prestamo)
        => Console.WriteLine($"No se puede aprobar un préstamo en estado: {Nombre}");
    
    public virtual void Rechazar(Prestamo prestamo, string motivo)
        => Console.WriteLine($"No se puede rechazar un préstamo en estado: {Nombre}");
    
    public virtual void Activar(Prestamo prestamo)
        => Console.WriteLine($"No se puede activar un préstamo en estado: {Nombre}");
    
    public virtual void Devolver(Prestamo prestamo)
        => Console.WriteLine($"No se puede devolver un préstamo en estado: {Nombre}");
    
    public virtual void MarcarVencido(Prestamo prestamo)
        => Console.WriteLine("No aplica para este estado");
    
    public virtual string ObtenerDescripcion(Prestamo prestamo)
        => $"Estado: {Nombre}";
}
```

**Paso 3: Crear estados concretos**

```csharp
public class EstadoPendiente : EstadoPrestamoBase
{
    public override string Nombre => "Pendiente";
    
    public override void Aprobar(Prestamo prestamo)
    {
        prestamo.Estado = "Aprobado";
        prestamo.FechaVencimiento = DateTime.Now.AddDays(14);
        Console.WriteLine($"✓ Préstamo aprobado, vence el {prestamo.FechaVencimiento:dd/MM/yyyy}");
    }
    
    public override void Rechazar(Prestamo prestamo, string motivo)
    {
        prestamo.Estado = "Rechazado";
        Console.WriteLine($"✗ Préstamo rechazado: {motivo}");
    }
}

public class EstadoAprobado : EstadoPrestamoBase
{
    public override string Nombre => "Aprobado";
    
    public override void Activar(Prestamo prestamo)
    {
        prestamo.Estado = "Activo";
        Console.WriteLine("✓ Préstamo activado, libro prestado");
    }
    
    public override string ObtenerDescripcion(Prestamo prestamo)
        => $"Aprobado, vence el {prestamo.FechaVencimiento:dd/MM/yyyy}";
}

public class EstadoActivo : EstadoPrestamoBase
{
    public override string Nombre => "Activo";
    
    public override void Devolver(Prestamo prestamo)
    {
        prestamo.Estado = "Devuelto";
        prestamo.FechaDevolucion = DateTime.Now;
        Console.WriteLine("✓ Libro devuelto exitosamente");
    }
    
    public override void MarcarVencido(Prestamo prestamo)
    {
        if (prestamo.FechaVencimiento < DateTime.Now)
        {
            prestamo.Estado = "Vencido";
            Console.WriteLine("⚠ Préstamo marcado como vencido");
        }
    }
    
    public override string ObtenerDescripcion(Prestamo prestamo)
        => $"Activo, vence el {prestamo.FechaVencimiento:dd/MM/yyyy}";
}

public class EstadoVencido : EstadoPrestamoBase
{
    public override string Nombre => "Vencido";
    
    public override void Devolver(Prestamo prestamo)
    {
        prestamo.Estado = "Devuelto";
        prestamo.FechaDevolucion = DateTime.Now;
        Console.WriteLine("⚠ Libro devuelto con retraso");
    }
    
    public override string ObtenerDescripcion(Prestamo prestamo)
        => "⚠ Vencido, requiere atención inmediata";
}

public class EstadoDevuelto : EstadoPrestamoBase
{
    public override string Nombre => "Devuelto";
    
    public override string ObtenerDescripcion(Prestamo prestamo)
        => $"Devuelto el {prestamo.FechaDevolucion:dd/MM/yyyy}";
}

public class EstadoRechazado : EstadoPrestamoBase
{
    public override string Nombre => "Rechazado";
    
    public override string ObtenerDescripcion(Prestamo prestamo)
        => "✗ Rechazado por el sistema";
}
```

**Paso 4: Modificar la clase Prestamo para usar estados**

```csharp
public class Prestamo
{
    public int Id { get; set; }
    public string Libro { get; set; }
    public string Usuario { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime? FechaDevolucion { get; set; }
    public DateTime? FechaVencimiento { get; set; }
    
    private IEstadoPrestamo _estado;
    
    // El estado se gestiona internamente
    public string Estado => _estado.Nombre;
    
    public Prestamo(string libro, string usuario)
    {
        Libro = libro;
        Usuario = usuario;
        FechaInicio = DateTime.Now;
        _estado = new EstadoPendiente();
    }
    
    // Métodos que delegan al estado
    public void Aprobar() => _estado.Aprobar(this);
    public void Rechazar(string motivo) => _estado.Rechazar(this, motivo);
    public void Activar() => _estado.Activar(this);
    public void Devolver() => _estado.Devolver(this);
    public void MarcarVencido() => _estado.MarcarVencido(this);
    public string ObtenerDescripcion() => _estado.ObtenerDescripcion(this);
    
    // Método interno para cambiar de estado
    internal void CambiarEstado(IEstadoPrestamo nuevoEstado)
    {
        _estado = nuevoEstado;
    }
}
```

**Paso 5: Simplificar el GestorPrestamos**

```csharp
public class GestorPrestamos
{
    // El gestor ahora es muy simple - solo necesita el préstamo
    public void Aprobar(Prestamo prestamo) => prestamo.Aprobar();
    public void Rechazar(Prestamo prestamo, string motivo) => prestamo.Rechazar(motivo);
    public void Activar(Prestamo prestamo) => prestamo.Activar();
    public void Devolver(Prestamo prestamo) => prestamo.Devolver();
    public void MarcarVencido(Prestamo prestamo) => prestamo.MarcarVencido();
    public string ObtenerDescripcion(Prestamo prestamo) => prestamo.ObtenerDescripcion();
}
```

### El Código "Después"

```csharp
class Program
{
    static void Main()
    {
        Console.WriteLine("=== Crear nuevo préstamo ===");
        var prestamo = new Prestamo("Cien Años de Soledad", "Juan Pérez");
        Console.WriteLine(prestamo.ObtenerDescripcion());
        
        Console.WriteLine("\n=== Aprobar ===");
        prestamo.Aprobar();
        Console.WriteLine(prestamo.ObtenerDescripcion());
        
        Console.WriteLine("\n=== Activar ===");
        prestamo.Activar();
        Console.WriteLine(prestamo.ObtenerDescripcion());
        
        Console.WriteLine("\n=== Intentar aprobar de nuevo ===");
        prestamo.Aprobar(); // No debería funcionar
        
        Console.WriteLine("\n=== Devolver ===");
        prestamo.Devolver();
        Console.WriteLine(prestamo.ObtenerDescripcion());
        
        Console.WriteLine("\n=== Intentar devolver de nuevo ===");
        prestamo.Devolver(); // No debería funcionar
        
        Console.WriteLine("\n=== Crear otro préstamo y rechazarlo ===");
        var prestamo2 = new Prestamo("El Principito", "María García");
        prestamo2.Rechazar("Límite de préstamos alcanzado");
        Console.WriteLine(prestamo2.ObtenerDescripcion());
    }
}
```

### Beneficios Obtenidos

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Agregar nuevo estado** | Modificar todos los métodos | Crear nueva clase de estado |
| **Transiciones inválidas** | No se detectan | Cada estado define qué puede hacer |
| **Testing** | Difícil probar estados | Cada estado se testa independientemente |
| **Lógica de un estado** | Dispersa en múltiples métodos | Centralizada en una clase |
| **OCP** | Violado | Cada estado es extensible sin modificar código existente |
| **SRP** | Violado | Cada clase tiene una sola responsabilidad |
| **Mantenibilidad** | Difícil | Fácil de entender y modificar |

### ¿Por qué State y no Strategy?

La confusión más común es entre State y Strategy. Aquí están las diferencias clave:

| Aspecto | State | Strategy |
|---------|-------|----------|
| **Quién decide el cambio** | El estado actual decide la transición | El cliente elige la estrategia explícitamente |
| **Transiciones** | Definen el objeto estado | Definidas externamente |
| **Cuándo cambia** | En respuesta a operaciones del objeto | En cualquier momento por el cliente |
| **Número de estados** | Finito y bien definido | Puede ser infinito |

En nuestro caso de préstamos:
- Las transiciones ocurren automáticamente en respuesta a las operaciones (aprobar → activar → devolver)
- El código cliente no debería elegir qué estado poner
- Los estados tienen un ciclo de vida definido

Esto hace que **State** sea la elección correcta.

### Bonus: Agregar reglas de transición con un validador

```csharp
public class ValidadorTransiciones
{
    private static readonly Dictionary<string, HashSet<string>> _permisidas = new()
    {
        ["Pendiente"] = new() { "Aprobado", "Rechazado" },
        ["Aprobado"] = new() { "Activo", "Pendiente" },
        ["Activo"] = new() { "Vencido", "Devuelto" },
        ["Vencido"] = new() { "Devuelto" },
        ["Devuelto"] = new(), // Estado terminal
        ["Rechazado"] = new() // Estado terminal
    };
    
    public static bool EsTransicionValida(string actual, string nueva)
    {
        return _permisidas.TryGetValue(actual, out var permitidas) && permitidas.Contains(nueva);
    }
}

// Uso en el estado para validar antes de cambiar
protected void CambiarEstadoSiValido(Prestamo prestamo, IEstadoPrestamo nuevoEstado)
{
    if (ValidadorTransiciones.EsTransicionValida(prestamo.Estado, nuevoEstado.Nombre))
    {
        prestamo.CambiarEstado(nuevoEstado);
    }
    else
    {
        Console.WriteLine($"✗ Transición no válida: {prestamo.Estado} -> {nuevoEstado.Nombre}");
    }
}
```

---

## 11. Conclusión

Los patrones GoF siguen siendo plenamente relevantes en el ecosistema actual. C# moderno con sus características (genéricos, lambdas, métodos de extensión, pattern matching) permite implementaciones más limpias de estos patrones.

En proyectos .NET con inyección de dependencias, los contenedores implementan indirectamente muchos de estos patrones. Los lifetimes Singleton, Scoped y Transient del contenedor DI cubren escenarios que históricamente requerían implementaciones manuales.

La clave está en la aplicación juiciosa:
1. **Identifica code smells primero:** bloques switch/if grandes, acoplamiento excesivo, duplicación de código
2. **Prioriza patrones de mayor impacto:** Strategy y Observer ofrecen beneficios inmediatos con baja inversión
3. **Usa refactorizaciones incrementales:** aplica patrones mediante pasos seguros respaldados por tests
4. **Documenta la decisión:** explica por qué elegiste ese patrón y qué problema resuelve

Los patrones de diseño son herramientas, no reglas absolutas. El objetivo es escribir código mantenible, no demostrar conocimiento de patrones.