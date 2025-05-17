import { Router } from 'express';
import webauthnRouter from './webauthn';

const apiRouter = Router();

// Connect WebAuthn routes
apiRouter.use('/webauthn', webauthnRouter);

export default apiRouter;