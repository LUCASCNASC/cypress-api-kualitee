const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/Defectsbyseverity';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('API rest - Dashboard - Dashboard Defect by Severity - /dashboard/defect_by_severity', () => {

  function defectBySeverity(body, options = {}) {
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
    defectBySeverity({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna corretamente quando todos os campos opcionais são passados', () => {
    defectBySeverity({ 
      token: validToken, 
      project_id: validProjectId,
      build_id: 1,
      module_id: 2,
      browser: 'chrome',
      os: 'windows',
      defect_severity: 'critical',
      defect_status: 'open',
      assignto: 'user_teste',
      bugtype: 'UI'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });
  
  it('Falha sem token', () => {
    defectBySeverity({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    defectBySeverity({ token: 'token_invalido', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    defectBySeverity({ token: 'token_expirado', project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    defectBySeverity({ token: null, project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    defectBySeverity({ token: '😀🔥💥', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    defectBySeverity({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha sem project_id', () => {
    defectBySeverity({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      defectBySeverity({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    defectBySeverity({ token: validToken, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });
  
  const optionalFields = [
    { key: 'build_id', valid: 1, invalids: [null, '', 'abc', -1, {}, [], true, false] },
    { key: 'module_id', valid: 2, invalids: [null, '', 'abc', -1, {}, [], true, false] },
    { key: 'browser', valid: 'chrome', invalids: [null, 123, {}, [], true, false] },
    { key: 'os', valid: 'windows', invalids: [null, 123, {}, [], true, false] },
    { key: 'defect_severity', valid: 'critical', invalids: [null, 123, {}, [], true, false] },
    { key: 'defect_status', valid: 'open', invalids: [null, 123, {}, [], true, false] },
    { key: 'assignto', valid: 'user_teste', invalids: [null, 123, {}, [], true, false] },
    { key: 'bugtype', valid: 'UI', invalids: [null, 123, {}, [], true, false] }
  ];

  optionalFields.forEach(field => {
    field.invalids.forEach(invalidValue => {
      it(`Falha com campo opcional '${field.key}' inválido (${JSON.stringify(invalidValue)})`, () => {
        defectBySeverity({ token: validToken, project_id: validProjectId, [field.key]: invalidValue }).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });
  
  it('Ignora campo extra no body', () => {
    defectBySeverity({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });
  
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, project_id: validProjectId },
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
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    defectBySeverity({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    defectBySeverity({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      defectBySeverity({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Permite requisições duplicadas rapidamente', () => {
    defectBySeverity({ token: validToken, project_id: validProjectId })
      .then(() => defectBySeverity({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});