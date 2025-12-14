const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/Defectsopenstatus';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('API rest - Dashboard - Dashboard Bug Open Status - /dashboard/bugopenstatus', () => {

  it('Status Code 200', () => {
    bugOpenStatus({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  it('Retorna corretamente quando todos os campos opcionais são passados', () => {
    bugOpenStatus({ 
      token: validToken, 
      project_id: validProjectId,
      build_id: 1,
      module_id: 2,
      browser: 'chrome',
      os: 'windows',
      severity: 'critical',
      status: 'open',
      assignto: 'user_teste',
      bugtype: 'UI'
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
    });
  });
  
  it('Falha sem token', () => {
    bugOpenStatus({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    bugOpenStatus({ token: 'token_invalido', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    bugOpenStatus({ token: 'token_expirado', project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    bugOpenStatus({ token: null, project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    bugOpenStatus({ token: '😀🔥💥', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    bugOpenStatus({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });
  
  it('Falha sem project_id', () => {
    bugOpenStatus({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha com project_id inexistente', () => {
    bugOpenStatus({ token: validToken, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    bugOpenStatus({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
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
    bugOpenStatus({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    bugOpenStatus({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      bugOpenStatus({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Permite requisições duplicadas rapidamente', () => {
    bugOpenStatus({ token: validToken, project_id: validProjectId })
      .then(() => bugOpenStatus({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});