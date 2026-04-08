import express, { Application } from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from './middlewares/error.middleware';
import { config } from './config';

const app: Application = express();

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Deltos API', version: '1.0.0', description: 'API Node + Express + Prisma' },
    servers: [{ url: `http://localhost:${config.port}` }],
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.router.ts', './src/modules/**/*.schema.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);

import { authRouter } from './modules/auth/auth.router';
import { userRouter } from './modules/users/user.router';
import { eventoRouter } from './modules/eventos/evento.router';
import { criterioRouter } from './modules/criterios/criterio.router';
import { equipoRouter } from './modules/equipos/equipo.router';
import { proyectoRouter } from './modules/proyectos/proyecto.router';
import { adminRouter } from './modules/admin/admin.router';
import { resultadosRouter } from './modules/resultados/resultados.router';
import { juezRouter } from './modules/jueces/juez.router';
import { avanceRouter } from './modules/avances/avance.router';
import { invitacionRouter } from './modules/invitaciones/invitacion.router';
import { constanciaRouter } from './modules/constancias/constancias.router';
import { reportesRouter } from './modules/reportes/reportes.router';
import { participanteDashboardRouter } from './modules/participante/participante.router';

import path from 'path';

// Middlewares
app.use(cors());
app.use(express.json());

// Serve uploaded files (avatars, etc.)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Root route for API health check
app.get('/', (req, res) => {
  res.json({
    message: 'API del Sistema de Gestión de Proyectos Académicos (Deltos) funcionando',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

import { carreraRouter } from './modules/carreras/carrera.router';
import { perfilesRouter } from './modules/perfiles/perfiles.router';

// Main Routes
app.use('/api/auth', authRouter);
app.use('/api/admin/usuarios', userRouter);
app.use('/api/admin/carreras', carreraRouter);
app.use('/api/admin/perfiles', perfilesRouter);
app.use('/api/admin/eventos', eventoRouter);
app.use('/api/admin/criterios', criterioRouter);
app.use('/api/admin/equipos', equipoRouter);
app.use('/api/admin/proyectos', proyectoRouter);
app.use('/api/admin/dashboard', adminRouter);
app.use('/api/admin/resultados', resultadosRouter);
app.use('/api/admin/constancias', constanciaRouter);
app.use('/api/admin/reportes', reportesRouter);
app.use('/api/juez', juezRouter);
app.use('/api/participante/avances', avanceRouter);
app.use('/api/participante/invitaciones', invitacionRouter);
app.use('/api/participante/dashboard', participanteDashboardRouter);

// Swagger Documentation Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global Error Handler (must be last middleware)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  errorMiddleware(err, req, res, next);
});

export default app;
