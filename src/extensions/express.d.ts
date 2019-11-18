import express from 'express';
import { TemplateObject } from '../web/Middleware/TemplateMiddleware';

declare global
{
    namespace Express 
    {
        interface Request
        {
            templateObject : TemplateObject;
            theme: string;
        }
    }
}