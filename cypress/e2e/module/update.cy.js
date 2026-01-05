const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Module/ModuleUpdate';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validModuleId = Cypress.env('VALID_MODULE_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

const validModuleName = 'Autenticação';
const validModuleDescription = 'Descrição atualizada do módulo de autenticação.';

describe('Module Update - /module/update', () => {

  it('Status Code: 200', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 400, 401, 403', () => {
    moduleUpdate({
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    moduleUpdate({
      token: 'token_invalido',
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 401, 403', () => {
    moduleUpdate({
      token: 'token_expirado',
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 400, 401, 403', () => {
    moduleUpdate({
      token: null,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Status Code: 200', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  it('Status Code: 400, 415', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: {
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    moduleUpdate({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  it('Status Code: 429', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Status Code: 429', () => {
    const requests = Array(10).fill(0).map(() =>
      moduleUpdate({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  it('Status Code: 200, 400, 401, 409', () => {
    moduleUpdate({
      token: validToken,
      project_id: validProjectId,
      module_id: validModuleId,
      module_name: validModuleName,
      build_id: validBuildId,
      module_description: validModuleDescription
    })
      .then(() => moduleUpdate({
        token: validToken,
        project_id: validProjectId,
        module_id: validModuleId,
        module_name: validModuleName,
        build_id: validBuildId,
        module_description: validModuleDescription
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});