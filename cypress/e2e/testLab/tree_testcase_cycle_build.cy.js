
const PATH_API = '/TestLab/TreeTestCaseCycleBuild'
const validToken = Cypress.env('VALID_TOKEN');

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validBuildId = Cypress.env('VALID_BUILD_ID');

const validCycleId = 1001;

describe('API rest - Manage Test Case Tree Testcase Cycle Build - /manage_test_case/tree_testcase_cycle_build', () => {
  
  function treeTestcaseCycleBuild(body, options = {}) {
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
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha sem token', () => {
    treeTestcaseCycleBuild({
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  ['token_invalido', null, '', 12345].forEach(token => {
    it(`Falha com token inválido (${JSON.stringify(token)})`, () => {
      treeTestcaseCycleBuild({
        token,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      }).then(response => {
        expect([400, 401, 403]).to.include(response.status);
      });
    });
  });

  
  ['project_id', 'build_id', 'cycle_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      };
      delete body[field];
      treeTestcaseCycleBuild(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      treeTestcaseCycleBuild({
        token: validToken,
        project_id,
        build_id: validBuildId,
        cycle_id: validCycleId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(build_id => {
    it(`Falha com build_id inválido (${JSON.stringify(build_id)})`, () => {
      treeTestcaseCycleBuild({
        token: validToken,
        project_id: validProjectId,
        build_id,
        cycle_id: validCycleId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(cycle_id => {
    it(`Falha com cycle_id inválido (${JSON.stringify(cycle_id)})`, () => {
      treeTestcaseCycleBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  
  it('Ignora campo extra no body', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId,
      foo: 'bar'
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
          build_id: validBuildId,
          cycle_id: validCycleId
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
        build_id: validBuildId,
        cycle_id: validCycleId
      },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    treeTestcaseCycleBuild({
      token: "' OR 1=1 --",
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  
  it('Headers devem conter CORS e content-type', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      treeTestcaseCycleBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  
  it('Permite requisições duplicadas rapidamente', () => {
    treeTestcaseCycleBuild({
      token: validToken,
      project_id: validProjectId,
      build_id: validBuildId,
      cycle_id: validCycleId
    }).then(() =>
      treeTestcaseCycleBuild({
        token: validToken,
        project_id: validProjectId,
        build_id: validBuildId,
        cycle_id: validCycleId
      })
    ).then((response) => {
      expect([200, 400, 401, 409]).to.include(response.status);
    });
  });

});