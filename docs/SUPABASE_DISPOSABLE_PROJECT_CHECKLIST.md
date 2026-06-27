# Supabase Disposable Project Checklist

> ESTADO: CHECKLIST DOCUMENTAL FUTURO.
>
> Este documento no crea proyecto Supabase, no aplica SQL, no valida RLS, no
> conecta la app, no contiene project ref, no contiene tokens, no contiene
> service-role, no contiene datos reales, no es produccion y no significa que
> el backend este listo.

## 1. Objetivo

Documentar como decidir si un proyecto Supabase manual puede considerarse
desechable y seguro para pruebas futuras de schema/RLS.

S4.6.3.1 solo define el gate humano previo. No crea proyecto, no ejecuta SQL,
no usa Supabase CLI, no conecta el CRUD y no autoriza usar datos reales.

## 2. Definicion de desechable

Un proyecto Supabase solo puede considerarse desechable si cumple todo:

- fue creado solo para pruebas;
- puede destruirse sin perder nada;
- no contiene datos reales;
- no contiene usuarios reales;
- no contiene media real;
- no esta conectado a produccion;
- no esta conectado a la app;
- no usa dominios reales;
- no se reutiliza para despliegue final;
- no comparte secrets con otros proyectos.

Si cualquiera de estos puntos genera duda, el resultado es **NO-GO**.

## 3. Checklist humano antes de crearlo o seleccionarlo

Antes de crear o seleccionar un proyecto Supabase futuro, confirmar:

- [ ] Git limpio.
- [ ] `node scripts/verify-supabase-isolation.mjs` pasa.
- [ ] `npm.cmd run build` pasa.
- [ ] `npm.cmd audit` esta limpio.
- [ ] La persona confirma que NO es produccion.
- [ ] La persona confirma que puede destruirse sin perdida.
- [ ] La persona confirma que no tiene datos reales.
- [ ] La persona confirma que no tiene tokens en capturas o logs.
- [ ] La persona confirma que el project ref se guardara fuera de Git.
- [ ] La persona confirma que service-role no se copiara al repo ni al frontend.
- [ ] La persona confirma que la app sigue desconectada.
- [ ] La persona confirma que SQL no se aplicara en esta fase.

## 4. Checklist de evidencia segura

Evidencia permitida, sin secretos:

- nombre conceptual del proyecto, por ejemplo `supabase-lab-disposable`, sin
  project ref real;
- confirmacion textual de `proyecto desechable`;
- confirmacion textual de `no produccion`;
- confirmacion textual de `sin datos reales`;
- confirmacion textual de `app desconectada`;
- confirmacion textual de `service-role no copiado`;
- `git status`;
- salida del verificador;
- build;
- audit;
- `npm.cmd ls @supabase/supabase-js`;
- `npm.cmd ls vite`.

Evidencia prohibida:

- screenshots con tokens;
- project ref real en docs;
- URL real del proyecto;
- anon key real;
- service-role;
- password;
- access token;
- emails reales.

## 5. Project ref handling

- El project ref real vive fuera de Git.
- No pegar project ref en ChatGPT/Codex si aparece junto con tokens, URLs
  sensibles o credenciales.
- En documentos y reportes, usar `<disposable_project_ref>`.
- Antes de cualquier SQL futuro, hacer doble confirmacion visual/manual del
  project ref fuera del repo.
- Si hay duda del project ref, el resultado es **NO-GO**.

## 6. Secrets handling

- La anon/publishable key no se versiona.
- Service-role nunca entra en frontend, Git, logs ni screenshots.
- Access tokens no se comparten.
- Passwords no se comparten.
- Si un secreto se expone, detener y rotar antes de seguir.
- `.env.local` sigue fuera de Git.
- `.env.example` solo usa placeholders.

## 7. Criterios GO

Un proyecto desechable solo queda listo para una fase futura si:

- fue creado o seleccionado manualmente;
- esta confirmado como desechable;
- esta confirmado como no produccion;
- esta confirmado sin datos reales;
- el project ref queda guardado fuera de Git;
- no hay service-role expuesto;
- la app no esta conectada;
- no se ejecuto SQL todavia;
- rollback entendido: destruir el proyecto;
- existe aprobacion humana explicita para avanzar.

## 8. Criterios NO-GO

Detener si:

- el proyecto podria ser produccion;
- el project ref es dudoso;
- hay datos reales;
- hay usuarios reales;
- hay emails reales;
- hay tokens en captura o log;
- aparece service-role;
- la app esta conectada;
- SQL ya fue aplicado sin autorizacion;
- Storage contiene archivos reales;
- no se puede destruir el proyecto;
- verificador, build o audit fallan;
- docs dicen estados no reales.

## 9. Relacion con fases futuras

- **S4.6.3.1:** solo checklist de proyecto desechable.
- **S4.6.3.2:** futura aplicacion manual de schema, si se autoriza.
- **S4.6.3.3:** futura aplicacion manual de RLS, si se autoriza.
- **S4.6.3.4:** futura verificacion post-SQL sin app.
- Fixtures y reset quedan para subfases separadas.
- **S4.6.4:** pruebas multiusuario/RLS con fixtures, todavia sin CRUD real.

Completar S4.6.3.1 no autoriza aplicar schema, RLS, fixtures o reset.

## 10. Riesgos

| Riesgo | Severidad | Mitigacion | Fase |
| --- | --- | --- | --- |
| Usar proyecto equivocado | Critica | Doble confirmacion manual del project ref fuera de Git | S4.6.3.1 |
| Filtrar project ref | Alta | Usar `<disposable_project_ref>` en docs/reportes | S4.6.3.1 |
| Filtrar anon/publishable key | Alta | No copiar keys a docs, chat, screenshots o Git | S4.6.3.1+ |
| Filtrar service-role | Critica | Prohibir frontend/Git/logs y rotar si se expone | Todas |
| Exponer tokens en screenshots | Critica | No compartir capturas sensibles | Todas |
| Usar datos reales | Critica | Solo datos sinteticos y entorno desechable | S4.6.3.1+ |
| Aplicar SQL antes de tiempo | Critica | Mantener S4.6.3.1 como checklist documental | S4.6.3.1 |
| Conectar app antes de tiempo | Critica | Verificador y repository local intactos | Todas |
| Confundir laboratorio con produccion | Critica | Nombre conceptual y confirmacion humana | S4.6.3.1 |
| No poder destruir el proyecto | Alta | NO-GO si no es descartable | S4.6.3.1 |
| Rollback falso | Alta | Rollback principal: destruir proyecto | S4.6.3.1+ |

## 11. Plantilla de reporte seguro

Completar sin secretos:

```txt
Git limpio: si/no
Verificador: passed/failed/fetch calls
Build: pasa/no pasa
Audit: 0 vulnerabilities/salida
Proyecto desechable confirmado: si/no
Produccion: no
Datos reales: no
App conectada: no
SQL aplicado: no
Project ref guardado fuera de Git: si/no
Service-role expuesto: no
Capturas/logs con tokens: no
Aprobacion humana para siguiente fase: pendiente/si/no
```

No incluir tokens, keys, passwords, URLs reales ni project ref real.

## 12. Anti-obsolescencia

- Crear este checklist no cambia runtime.
- Crear este checklist no crea proyecto Supabase.
- Crear este checklist no aplica SQL.
- Crear este checklist no prueba RLS.
- Crear este checklist no conecta Supabase.

Si en una futura fase se crea un proyecto manualmente, los docs deben decir
`proyecto desechable seleccionado/creado manualmente`, no `backend listo`.

Evitar estas frases salvo como advertencias de no uso:

- Supabase validado.
- RLS probada.
- backend listo.
- app conectada.
- proyecto de produccion.
- fixtures aplicados.
- reset probado.
- produccion lista.

