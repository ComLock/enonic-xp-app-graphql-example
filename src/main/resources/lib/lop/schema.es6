import { getMultiRepoConnectCommand } from './schema/multiRepoConnection';
import { getRepoCommand } from './schema/repo';
import { getConnectCommand } from './schema/repoConnection';
import {
    createObjectType,
    createSchema,
} from '/lib/graphql';


const NAME       = 'schema';
const TYPE       = 'lib';
const LOG_PREFIX = `${NAME} ${TYPE}`;

let cache = {}; // connections


const ROOT_QUERY_TYPE = createObjectType({
    name: 'Query',
    description: 'Query description',
    fields: {
        connect:          getConnectCommand({ cache }),
        multiRepoConnect: getMultiRepoConnectCommand({ cache }),
        repo:             getRepoCommand({}),
    } // fields
}); // ROOT_QUERY_TYPE


export function getSchema() {
    return createSchema({ query: ROOT_QUERY_TYPE });
} // function getSchema
