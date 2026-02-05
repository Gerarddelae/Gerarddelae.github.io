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

## Resumen ejecutivo

El corazón del capítulo es el motor de almacenamiento: cómo se organizan, escriben y leen los datos en disco y memoria. Kleppmann diferencia dos familias principales —motores optimizados para transacciones (OLTP) y para análisis (OLAP)— y explica por qué las decisiones internas (B-Trees vs LSM-Trees, almacenamiento por columnas, compresión) determinan rendimiento, latencias y escalabilidad.

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

## Aplicaciones prácticas

- Si tu aplicación es mayoritariamente OLTP (consultas por ID, muchas transacciones pequeñas), favorece B-Trees o soluciones maduras como Postgres/MySQL.
- Si esperas tasas de escritura muy altas (ingest masivo, logs), considera LSM-Trees (Cassandra, RocksDB) y planifica estrategias de compactación y monitorización de latencias de percentil alto.
- Para analítica a escala (agregaciones sobre millones/miles de millones de filas), usa almacenamiento columnar con compresión y vectorización.

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
