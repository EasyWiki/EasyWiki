import express from 'express';
import { TemplateObject } from '../web/Middleware/TemplateMiddleware';
import { Theme } from '../modules/Theme';

declare global
{
    namespace Express 
    {
        interface Request
        {
            templateObject : TemplateObject;
            theme: Theme;
            accent: string;
        }
    }
}