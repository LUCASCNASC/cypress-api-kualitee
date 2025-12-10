const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Module/ModuleDelete';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');

describe('API rest - Module Delete - /module/delete', () => {

  function moduleDelete(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Status Code 200', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha sem token', () => {
    moduleDelete({
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    moduleDelete({
      token: 'token_invalido',
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    moduleDelete({
      token: 'token_expirado',
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    moduleDelete({
      token: null,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id/module_id[0] inválidos, ausentes, tipos errados, limites ---
  it('Falha sem project_id', () => {
    moduleDelete({
      token: validToken,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha sem module_id[0]', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId
    }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      moduleDelete({
        token: validToken,
        project_id,
        'module_id[0]': validModuleId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(module_id => {
    it(`Falha com module_id[0] inválido (${JSON.stringify(module_id)})`, () => {
      moduleDelete({
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': module_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    moduleDelete({
      token: validToken,
      project_id: 999999,
      'module_id[0]': validModuleId
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Falha com module_id[0] inexistente', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': 999999
    }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: {
          token: validToken,
          project_id: validProjectId,
          'module_id[0]': validModuleId
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': validModuleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    moduleDelete({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Headers devem conter CORS e content-type', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      moduleDelete({
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': validModuleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Permite requisições duplicadas rapidamente', () => {
    moduleDelete({
      token: validToken,
      project_id: validProjectId,
      'module_id[0]': validModuleId
    })
      .then(() => moduleDelete({
        token: validToken,
        project_id: validProjectId,
        'module_id[0]': validModuleId
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});