const PATH_API = '/Project/ProjectStatus';
const validToken = Cypress.env('VALID_TOKEN');

const validProjectStatus = 'ativo';
const validProjectId0 = 77;
const validProjectId1 = 78;

describe('API - Project Status - /project/project_status', () => {

  function projectStatus(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Atualiza status de projetos com todos os campos válidos', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    projectStatus({
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    projectStatus({
      token: 'token_invalido',
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    projectStatus({
      token: 'token_expirado',
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    projectStatus({
      token: null,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_status', 'project_id[0]', 'project_id[1]'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = {
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': validProjectId0,
        'project_id[1]': validProjectId1
      };
      delete body[field];
      projectStatus(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios vazios ---
  it('Falha com project_status vazio', () => {
    projectStatus({
      token: validToken,
      project_status: '',
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- project_id inválido ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(invalidId => {
    it(`Falha com project_id[0] inválido (${JSON.stringify(invalidId)})`, () => {
      projectStatus({
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': invalidId,
        'project_id[1]': validProjectId1
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
    it(`Falha com project_id[1] inválido (${JSON.stringify(invalidId)})`, () => {
      projectStatus({
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': validProjectId0,
        'project_id[1]': invalidId
      }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1,
      extra: 'foo'
    }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          token: validToken,
          project_status: validProjectStatus,
          'project_id[0]': validProjectId0,
          'project_id[1]': validProjectId1
        },
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type text/plain', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }, { headers: { 'Content-Type': 'text/plain' } }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    projectStatus({
      token: "' OR 1=1 --",
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      projectStatus({
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': validProjectId0,
        'project_id[1]': validProjectId1
      })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    projectStatus({
      token: validToken,
      project_status: validProjectStatus,
      'project_id[0]': validProjectId0,
      'project_id[1]': validProjectId1
    })
      .then(() => projectStatus({
        token: validToken,
        project_status: validProjectStatus,
        'project_id[0]': validProjectId0,
        'project_id[1]': validProjectId1
      }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});