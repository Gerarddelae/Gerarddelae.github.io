---
title: "Reseña — Designing Data-Intensive Applications — Capítulo 3"
description: "Estructura y notas para el resumen del capítulo 3 de 'Designing Data-Intensive Applications'."
pubDate: 2026-02-07
coverImage: ./cap3.png
tags:
  - book-review
  - ddia
  - capítulo-3
---

# Reseña — Capítulo 3

## Resumen

El capítulo 3 disecciona el "motor" donde viven los datos: las estructuras y algoritmos que hacen posible guardar, recuperar y procesar información a escala. Kleppmann muestra que entender un sistema de almacenamiento no es un ejercicio académico: es la base para decidir cómo responderán tus aplicaciones bajo carga. El capítulo articula dos familias de motores según el patrón de uso: OLTP (de baja latencia, muchas operaciones pequeñas) y OLAP (consultas pesadas, agregaciones sobre grandes volúmenes), y explica por qué las optimizaciones internas de cada familia son radicalmente distintas.

En OLTP la discusión central es entre diseño basado en páginas (B-Trees) y diseño basado en logs/segmentos (LSM-Trees). Los B-Trees son veteranos probados: permiten actualizaciones in-place y lecturas con latencias bajas y predecibles, ideales para accesos por clave y transacciones con durabilidad. Por su parte, los LSM-Trees reorganizan la carga de trabajo: aceptan escrituras en memoria (memtable), las vuelcan a disco como SSTables ordenadas y las compactan posteriormente, transformando escrituras aleatorias en secuenciales para maximizar throughput en disco moderno.

Kleppmann no solo describe las estructuras, también examina sus costes operativos: la amplificación de escritura causada por compactaciones en LSM, las pausas de latencia inducidas por procesos de mantenimiento, y la sobrecarga que introducen los índices secundarios. A nivel analítico, el autor dedica atención al almacenamiento columnar: separar columnas permite una compresión mucho mayor y reduce el I/O cuando las consultas tocan pocas columnas, además de habilitar ejecución vectorizada que mejora throughput en agregaciones.

El insight práctico que atraviesa el capítulo es esto: no existe una "mejor" estructura en abstracto; hay decisiones técnicas con consecuencias medibles en latencia, throughput, coste operativo y complejidad de ingeniería. La elección entre B-Tree, LSM o columnar debe basarse en patrones de acceso, tolerancia a latencias de cola y capacidades de operación (monitorización, compactación, mantenimiento de índices).

## Puntos clave

1. Indexar tiene un precio: los índices aceleran lecturas pero penalizan escrituras.
2. LSM-Trees vs. B-Trees: LSM convierte escrituras aleatorias en secuenciales; B-Trees mantienen páginas actualizables y excelsan en lecturas de baja latencia.
3. OLTP vs. OLAP: motores distintos para cargas transaccionales y analíticas; no hay talla única.
4. Compresión por columnas: almacenar por columnas permite compresión agresiva y reduce I/O en consultas analíticas.

## Conceptos importantes

- **SSTables (Sorted String Tables):** archivos de segmentos con claves ordenadas; base de LSM-Trees y eficientes para merges.
- **Memtable:** estructura en memoria (p.ej. árbol equilibrado) que recibe escrituras antes de volcarse a disco como SSTables.
- **Write-Ahead Log (WAL):** log append-only usado para recuperación de la memtable tras fallos.
- **Amplificación de escritura (Write Amplification):** una sola operación lógica puede producir múltiples escrituras físicas durante compactaciones.
- **Filtros de Bloom:** estructura probabilística que evita lecturas de disco cuando una clave no existe.

## Ejemplos y diagramas

- Bitcask (Riak): ejemplo de índice de hash en memoria con archivos de datos append-only.
- LevelDB / RocksDB: implementaciones modernas de LSM-Trees embebibles; ejemplifican memtable → SSTable → compactación.
- Cassandra / HBase: sistemas distribuidos que usan SSTables y memtables (inspirados por Bigtable).
- Lucene: usa estructuras similares a SSTables para el índice invertido; fundamento de Elasticsearch/Solr.
- Vertica / Redshift: ejemplos claros de almacenamiento columnar para analítica masiva.

Diagrama sugerido: flujo de escritura (cliente → WAL → memtable → SSTable → compactación) y comparación de layout en disco entre B-Tree y LSM.

## Preguntas para repaso

1. ¿Por qué un índice mejora lecturas pero degrada escrituras? — verifica la comprensión del trade-off entre I/O adicional y latencia.
2. ¿Cómo funcionan las compactaciones en LSM-Trees y qué consecuencias tienen en latencias y uso de disco? — profundiza en write amplification y pausas.
3. ¿En qué escenarios elegirías almacenamiento columnar sobre row-store? — ejercicio práctico para diseñar soluciones OLAP.
4. ¿Cómo afectarían las memorias persistentes (NVM) al diseño de LSM vs B-Tree? — pensar en latencias de persistencia y actualizaciones in-place.

## Aplicaciones prácticas

- Si tu aplicación es mayoritariamente OLTP (consultas por ID, muchas transacciones pequeñas), favorece B-Trees o soluciones maduras como Postgres/MySQL.
- Si esperas tasas de escritura muy altas (ingest masivo, logs), considera LSM-Trees (Cassandra, RocksDB) y planifica estrategias de compactación y monitorización de latencias de percentil alto.
- Para analítica a escala (agregaciones sobre millones/miles de millones de filas), usa almacenamiento columnar con compresión y vectorización.

## Conexiones con el capítulo 1

- **Confiabilidad:** el `WAL` (Write-Ahead Log) aparece como el fundamento para garantizar durabilidad ante fallos; es la forma en que los motores aseguran que las escrituras no se pierdan antes de persistir estructuras más eficientes en disco.
- **Escalabilidad:** LSM demuestra cómo organizar el flujo de datos para optimizar discos magnéticos y SSDs; la separación entre escritura secuencial y lectura ordenada es una palanca para escalar ingest sin colapsar rendimiento.
- **Mantenibilidad:** elegir el motor correcto reduce la fricción operacional; una mala elección obliga a ingeniería adicional (vistas materializadas, pipelines de backfill, tareas de compactación manual).

## Preguntas y temas para profundizar

1. ¿Cómo cambiarán estos motores con la llegada de memorias no volátiles (NVM) que borran la línea entre RAM y disco?
2. ¿Hasta qué punto el almacenamiento por columnas puede integrarse en bases de datos OLTP sin sacrificar el rendimiento de las escrituras?
3. ¿Qué métricas operativas (p99 latencia, write amplification, IOPS) deberíamos priorizar al elegir motor?

## Notas y citas

- "Las bases de datos son, en esencia, solo dos funciones: una para guardar y otra para recuperar".
- "Los lectores nunca bloquean a los escritores, y los escritores nunca bloquean a los lectores" (en el contexto de aislamiento de instantáneas).
- "El ordenamiento secuencial de las escrituras es la clave para un alto rendimiento en disco".

## Notas personales / Reflexiones

- Kleppmann desmitifica la idea de una solución única: todo es compromiso. Los LSM-Trees brillan en escritura sostenida, pero requieren ingeniería para mitigar compactaciones y latencias de cola. Para equipos acostumbrados a B-Trees, entender LSM ofrece nuevas palancas de diseño.

## Referencias

- Papers y tecnologías citadas: Bigtable (Google), LevelDB, RocksDB, Bitcask, Cassandra, HBase, Lucene.
- Almacenes columnar: Vertica, Redshift; artículos sobre compresión por columnas y ejecución vectorizada.

## Checklist rápido

- [ ] ¿Tu carga es OLTP? (Muchos usuarios, pocas filas por consulta, acceso por ID)
  - Elige B-Trees para estabilidad y lecturas rápidas.
  - Elige LSM-Trees para tasas de escritura muy altas.
- [ ] ¿Tu carga es OLAP? (Pocos usuarios, millones de filas por consulta, agregaciones)
  - Elige almacenamiento por columnas.
- [ ] ¿Tus datos caben en RAM?
  - Considera una base de datos in-memory para reducir latencia.
- [ ] ¿Necesitas escaneos de rango frecuentes?
  - Prefiere estructuras ordenadas como SSTables o B-Trees sobre índices hash puros.
