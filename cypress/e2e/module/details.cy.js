const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Module/ModuleDetail';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

describe('API rest - Module Detail - /module/details', () => {

  it('Status Code 200', () => {
    moduleDetails({ token: validToken, project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    moduleDetails({ project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    moduleDetails({ token: 'token_invalido', project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    moduleDetails({ token: 'token_expirado', project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    moduleDetails({ token: null, project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    moduleDetails({ token: validToken, module_id: validModuleId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem module_id', () => {
    moduleDetails({ token: validToken, project_id: validProjectId }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha com project_id inexistente', () => {
    moduleDetails({ token: validToken, project_id: 999999, module_id: validModuleId }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Falha com module_id inexistente', () => {
    moduleDetails({ token: validToken, project_id: validProjectId, module_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Ignora campo extra nos parâmetros', () => {
    moduleDetails({ token: validToken, project_id: validProjectId, module_id: validModuleId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'GET',
      url: `/${PATH_API}`,
      qs: { token: validToken, project_id: validProjectId, module_id: validModuleId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415, 200]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    moduleDetails({ token: "' OR 1=1 --", project_id: validProjectId, module_id: validModuleId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    moduleDetails({ token: validToken, project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      moduleDetails({ token: validToken, project_id: validProjectId, module_id: validModuleId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    moduleDetails({ token: validToken, project_id: validProjectId, module_id: validModuleId })
      .then(() => moduleDetails({ token: validToken, project_id: validProjectId, module_id: validModuleId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});