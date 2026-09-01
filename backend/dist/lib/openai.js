"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOpenAIConfigured = exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
const env_js_1 = require("../config/env.js");
exports.openai = env_js_1.env.OPENAI_API_KEY && env_js_1.env.OPENAI_API_KEY !== 'your_openai_api_key_here'
    ? new openai_1.default({ apiKey: env_js_1.env.OPENAI_API_KEY })
    : null;
const hasOpenAIConfigured = () => {
    return exports.openai !== null;
};
exports.hasOpenAIConfigured = hasOpenAIConfigured;
