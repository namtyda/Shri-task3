import * as jsonToAst from 'json-to-ast';
import '../vendor/linter';

export type JsonAST = jsonToAst.AstJsonEntity | undefined;

export interface LinterProblem<TKey> {
    key: TKey;
    loc: jsonToAst.AstLocation;
}

export function makeLint<TProblemKey>(
    json: string,
    validateProperty: (property: jsonToAst.AstProperty) => LinterProblem<TProblemKey>[],
    validateObject: (property: jsonToAst.AstObject) => LinterProblem<TProblemKey>[]
): LinterProblem<TProblemKey>[] {

    function walk(
        node: jsonToAst.AstJsonEntity,
        cbProp: (property: jsonToAst.AstProperty) => void,
        cbObj: (property: jsonToAst.AstObject) => void
    ) {
        switch (node.type) {
            case 'Array':
                node.children.forEach((item: jsonToAst.AstJsonEntity) => {
                    walk(item, cbProp, cbObj);
                });
                break;
            case 'Object':
                cbObj(node);

                node.children.forEach((property: jsonToAst.AstProperty) => {
                    cbProp(property);
                    walk(property.value, cbProp, cbObj);
                });
                break;
        }
    }

    function parseJson(json: string): JsonAST { return jsonToAst(json); }

    const ast: JsonAST = parseJson(json);
    let errors: LinterProblem<TProblemKey>[] = [];

    const linter = lint(json);
    errors = errors.concat(linter.map(({ error, location }) => {
        return {
            key: error,
            loc: location
        } as LinterProblem<TProblemKey>;
    }));
    return errors;
}
