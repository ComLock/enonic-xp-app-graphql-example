import {
    createObjectType,
    GraphQLString,
    nonNull,
} from '/lib/graphql';


const NAME       = 'schema/node';
const TYPE       = 'lib';
const LOG_PREFIX = `${NAME} ${TYPE}`;


export const NODE_OBJECT_TYPE = createObjectType({
    name: 'Node',
    description: 'Node description',
    fields: {
        _id:                  { type: nonNull(GraphQLString) }, // node
        _name:                { type: nonNull(GraphQLString) }, // node
        _path:                { type: nonNull(GraphQLString) }, // node
        _childOrder:          { type: nonNull(GraphQLString) }, // node
        _indexConfig:         { type: nonNull(GraphQLString) }, // node
        _inheritsPermissions: { type: nonNull(GraphQLString) }, // node
        _permissions:         { type: nonNull(GraphQLString) }, // node
        _state:               { type: nonNull(GraphQLString) }, // node
        _nodeType:            { type: GraphQLString }, // node
        _versionKey:          { type: nonNull(GraphQLString) }, // node
        _timestamp:           { type: nonNull(GraphQLString) }, // node
        displayName:          { type: GraphQLString }, // content
        creator:      { type: GraphQLString }, // content
        createdTime:  { type: GraphQLString }, // content
        data:         { type: GraphQLString }, // content
        language:     { type: GraphQLString }, // content
        modifiedTime: { type: GraphQLString }, // content
        modifier:     { type: GraphQLString }, // content
        owner:        { type: GraphQLString }, // content
        page:         { type: GraphQLString }, // content
        publish:      { // content
            type: createObjectType({
                name: 'Fields',
                fields: {
                    first: { type: GraphQLString },
                    from:  { type: GraphQLString },
                }
            }),
        },
        type:         { type: GraphQLString }, // content
        x:            { type: GraphQLString }, // content
    } // fields
}); // NODE_OBJECT_TYPE
