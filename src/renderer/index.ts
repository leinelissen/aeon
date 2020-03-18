import './index.css';
import { RepositoryCommands, RepositoryArguments } from '../main/lib/repository/types';
import { ServiceCommands } from '../main/services/types';

window.api.sourceMapSupport.install();
console.log('👋 This message is being logged by "renderer.js", included via webpack');

window.api.invoke('repository', RepositoryCommands.STATUS)
    .then(console.log);

window.api.invoke('services', ServiceCommands.UPDATE, 'instagram')
    .then(() => window.api.invoke('repository', RepositoryCommands.DIFF, RepositoryArguments.STAGE, RepositoryArguments.HEAD))
    .then(console.log)
    .then(() => window.api.invoke('repository', RepositoryCommands.LOG))
    .then(console.log);