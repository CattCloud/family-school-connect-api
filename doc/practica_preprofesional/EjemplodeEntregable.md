![](Aspose.Words.25fe822d-8d1c-4884-9474-13432497fd79.001.png)

**UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS** 

**(Universidad del Perú, Decana de América)**

**Facultad de Ingeniería de Sistemas e Informática**

![](Aspose.Words.25fe822d-8d1c-4884-9474-13432497fd79.002.png)

**“ENTREGABLE 7 – PPP”** 

**PRÁCTICAS PRE PROFESIONALES** 

**PROFESOR** 

**William Martín, Enriquez Maguiña** 

**PRESENTADO POR** 

**Huere Sánchez, Miguel Ángel** 

**Lima-Perú** 

**2025** 

**Informe del Séptimo Entregable – Controles Lógicos** 

**Objetivo del Entregable** 

Validar la gestión de accesos y perfiles de usuario en los sistemas críticos de la Fiduciaria (Fidunet, Gestor, BUK y Active Directory), asegurando que las cuentas correspondan a colaboradores vigentes, con privilegios acordes a sus funciones, y que las bajas de usuarios cesados se realicen de forma oportuna y controlada.

El propósito fue identificar accesos indebidos, cuentas inactivas o sin responsable asignado, verificando la efectividad de los controles implementados para la protección de la información institucional. 

Este análisis fortaleció el cumplimiento de los principios de Proporcionalidad y Seguridad establecidos en los artículos 8 y 9 de la Ley N.º 29733 – Ley de Protección de Datos Personales, así como los lineamientos de COBIT 2019 (DSS05: Asegurar la Seguridad de Servicios) y la Res. SBS N.º 504-2021, que regulan la gestión segura de accesos y credenciales en el sector financiero.

**Metodología Aplicada** 

El proceso se desarrolló bajo un enfoque de auditoría automatizada, combinando revisión documental con análisis de datos:

1. **Obtención y consolidación de información:**

   Se recopilaron las planillas de usuarios activos y cesados proporcionadas por Recursos Humanos, y los listados de usuarios con acceso a los sistemas tecnológicos. 

2. **Normalización de registros:** 

   Mediante Python (Pandas) se estandarizaron los identificadores de usuario, DNIs y nombres, eliminando inconsistencias y errores tipográficos que pudieran afectar la precisión del análisis. 

3. **Validación de cuentas y accesos:**

   Se compararon las planillas de RR.HH. con los accesos otorgados en cada sistema, verificando: 

- Que los usuarios cesados no mantuvieran cuentas activas.
- Que no existieran cuentas genéricas o sin responsable definido.
- Que los perfiles de acceso se encuentren alineados a las funciones del puesto. 
4. **Registro y análisis de hallazgos:** 

   Los resultados se documentaron en un Reporte de Accesos Lógicos y Perfiles (Excel), clasificando los hallazgos por tipo y criticidad.

**Herramientas Utilizadas** 

- Python (Pandas): análisis automatizado de coincidencias y detección de anomalías. 
- Jupyter Notebook: desarrollo y ejecución del script de validación de usuarios.
- Microsoft Excel: consolidación de resultados y elaboración de la matriz de hallazgos. 
- OneDrive: respaldo de reportes y evidencias de validación.

**Actividades Realizadas** 

- Extracción de datos de usuarios activos, cesados y registros de sistemas.
- Limpieza, homologación y validación de la información.
- Identificación de cuentas activas de excolaboradores y accesos duplicados o no justificados. 
- Revisión de roles con privilegios administrativos elevados.
- Documentación de observaciones y elaboración del reporte final de hallazgos.

**Evidencias** 

- Script de Validación de Usuarios (.ipynb) con la lógica de comparación y detección. 
- Reporte de Accesos Lógicos y Perfiles (.xlsx) con los hallazgos clasificados.
- Capturas de evidencias del proceso de validación y resultados.

  ![](Aspose.Words.25fe822d-8d1c-4884-9474-13432497fd79.003.jpeg)

  ![](Aspose.Words.25fe822d-8d1c-4884-9474-13432497fd79.004.jpeg)

  ![](Aspose.Words.25fe822d-8d1c-4884-9474-13432497fd79.005.jpeg)

**Dificultades Encontradas** 

- Diferencias en la codificación de usuarios entre RR.HH. y los sistemas TI.
- Falta de sincronización en la baja de cuentas de cesados.
- Roles mal definidos o accesos heredados de antiguos puestos.
- Limitada documentación sobre la política formal de acceso lógico.

**Lecciones Aprendidas**

- Fortalecí la coordinación interáreas al comprobar que una comunicación constante entre Recursos Humanos y TI es esencial para garantizar la baja oportuna de cuentas de usuarios cesados y mantener la integridad de los accesos. 
- Consolidé mis competencias en auditoría de accesos y privilegios, comprendiendo cómo la gestión inadecuada de perfiles puede convertirse en un riesgo operativo y reputacional para la Fiduciaria.
- Perfeccioné el uso de Python (Pandas) como herramienta de análisis automatizado, aprendiendo a depurar, comparar y validar grandes volúmenes de datos con trazabilidad y exactitud.
- Comprendí el valor estratégico de un sistema IAM (Identity and Access Management) para centralizar la administración de identidades y prevenir accesos indebidos antes de que se materialicen los riesgos.
- Reafirmé la importancia de la documentación técnica y de evidencia, asegurando que cada hallazgo registrado cuente con respaldo verificable, fortaleciendo la trazabilidad del proceso de auditoría y la calidad del informe final.

**Competencias Desarrolladas en el Entregable 7** 

**Competencias Genéricas**

**CG1 – Valores, compromiso ético y social**

Durante la validación de accesos y perfiles, reforcé la responsabilidad ética que implica tratar información sensible de colaboradores y credenciales de acceso en entornos financieros. Apliqué los principios de Proporcionalidad (art. 8) y Seguridad (art. 9) de la Ley N.° 29733 – Ley de Protección de Datos Personales, asegurando que solo se analizara la información estrictamente necesaria y que las evidencias se almacenaran en entornos seguros (OneDrive corporativo). Asimismo, consideré las disposiciones de la Res. SBS 504-2021 sobre seguridad de la información y la Res. SBS 2116-2009 sobre riesgo operacional. Aprendí que cada revisión no es solo un procedimiento técnico, sino un acto de responsabilidad ética que protege la confidencialidad y la confianza del sistema financiero. 

**CG3 – Capacidad de análisis y pensamiento crítico** 

Apliqué razonamiento analítico para identificar cuentas activas de usuarios cesados, accesos duplicados y perfiles con privilegios no justificados en los sistemas Fidunet, Gestor, BUK y Active Directory. Analicé las causas de cada hallazgo y su impacto operativo, clasificándolos por criticidad según criterios del Marco de Evaluación de Riesgos (RAF) y las buenas prácticas de COBIT 2019 (DSS05: Asegurar la Seguridad de Servicios). Aprendí a cuestionar la efectividad real de los controles más allá de la documentación formal y a proponer mejoras realistas como flujos automáticos de baja o revisiones mensuales de privilegios.

**CG4 – Habilidad para la comunicación oral y escrita** 

Elaboré el Reporte de Accesos Lógicos y Perfiles, documentando hallazgos y recomendaciones con un lenguaje técnico claro, verificable y alineado a los estándares del área de Auditoría TI. Asimismo, participé en reuniones de coordinación y revisión de resultados con los auditores senior y el área de TI a través de Microsoft Teams, presentando los hallazgos de manera estructurada y sustentada con evidencias. Aprendí que una comunicación efectiva basada en datos, claridad y documentación precisa es esencial para que las áreas involucradas comprendan la magnitud de los riesgos y ejecuten acciones correctivas oportunas.

**Competencias Específicas** 

**CT1.1 – Aplicación de metodologías, estándares y métricas de calidad** 

Apliqué un enfoque de auditoría fundamentado en los marcos COSO y RAF, junto con las Resoluciones SBS 504-2021 y 2116-2009, que establecen criterios para la gestión de seguridad y riesgo operativo. 

**Cómo lo hice:** estructuré las pruebas de control en cuatro etapas – planificación, obtención de evidencias, análisis y validación – definiendo métricas objetivas como tipo de usuario, sistema involucrado, estado de cuenta y nivel de criticidad.

**Qué usé:** herramientas de Python (Pandas) para automatizar el análisis, Excel para la matriz de riesgos y un checklist de control interno para verificar la calidad de los resultados. 

**Aprendizaje:** entendí que la estandarización de métricas y la documentación de evidencias fortalecen la trazabilidad y permiten sustentar hallazgos ante revisiones internas o regulatorias. 

**CT2.2 – Construcción y gestión de repositorios de datos** 

Integré información procedente de Recursos Humanos (planillas de usuarios activos y cesados) y de los sistemas Fidunet, Gestor, BUK y Active Directory en un repositorio centralizado. 

**Cómo lo hice:** normalicé los registros de usuario (DNI, nombres, códigos) para evitar duplicidades y generé un dataset limpio para los cruces automáticos. 

**Qué usé:** Python (Pandas) para limpiar y homologar datos, Excel corporativo para presentar hallazgos y OneDrive institucional para almacenar versiones seguras del entregable con control de permisos. 

**Aprendizaje:** confirmé que la gestión estructurada de repositorios garantiza la integridad, disponibilidad y trazabilidad de la información auditada, facilitando el seguimiento posterior de cada hallazgo. 

**CT2.3 – Gestión de calidad y seguridad de la información** 

Validé los controles de identidad y acceso (IAM) revisando la correspondencia entre usuarios vigentes y sus privilegios en los sistemas críticos. 

**Cómo lo hice:** verifiqué que las cuentas de excolaboradores estuvieran dadas de baja, detecté privilegios heredados y evalué la segregación de funciones, alineando todo con el principio de mínimo privilegio exigido por la Res. SBS 504-2021 y los artículos 8 y 9 de la Ley 29733 (proporcionalidad y seguridad). 

**Qué usé:** consultas automatizadas en Python, matrices de observaciones en Excel y revisión de logs de acceso. 

**Aprendizaje**: aprendí que la verdadera seguridad no depende de políticas escritas, sino de la eficacia de los controles en operación y de su validación continua. 

**CT4.3 – Identificación de problemas en el contexto de desempeño** 

Detecté como problema la falta de sincronización entre las bajas de usuarios en RR. HH. y la desactivación en los sistemas TI, lo que generaba cuentas activas de personal cesado. 

**Cómo lo hice:** realicé cruces automatizados entre planillas y accesos, identifiqué casos 

específicos y documenté la evidencia con fechas, responsables y sistemas afectados. **Qué usé:** Python (Pandas) para los cruces de datos, Excel para consolidar hallazgos y Teams para coordinar con RR. HH. y Seguridad TI. 

**Aprendizaje:** desarrollé capacidad para fundamentar problemas con evidencia verificable y proponer soluciones preventivas como alertas automáticas, revisiones mensuales y controles de aprobación. 

**Conclusiones**

El séptimo entregable permitió verificar la correcta administración de accesos y perfiles en los sistemas críticos de la Fiduciaria. Se identificaron casos donde usuarios cesados mantenían cuentas activas o privilegios innecesarios, generando riesgos de acceso no autorizado a información sensible.

El uso de Python y Excel facilitó la trazabilidad y exactitud de los resultados, reforzando la aplicación de los principios de Seguridad y Confidencialidad (Ley 29733) y las buenas prácticas de COBIT 2019. 

En conclusión, este análisis contribuye directamente a mejorar el control interno, reducir el riesgo operativo y fortalecer la gobernanza tecnológica de la organización.
