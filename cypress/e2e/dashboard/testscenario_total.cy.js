const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/TestScenarioTotal';

const validProjectId = Cypress.env('VALID_PROJECT_ID');

describe('API rest - Dashboard - Dashboard Test Scenario Total - /dashboard/testscenario/total', () => {

  const validBody = {
    project_id: validProjectId,
    token: validToken,
    build_id: 22,
    module_id: 33,
    requirement: 'REQ-001',
    'created_by[0]': 101
  };

  function scenarioTotal(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Retorna total de cenários de teste com parâmetros completos e válidos', () => {
    scenarioTotal(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
      // Ajuste conforme contrato real
    });
  });

  it('Retorna total de cenários de teste apenas com obrigatórios', () => {
    scenarioTotal({ project_id: validProjectId, token: validToken }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    scenarioTotal({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {
    scenarioTotal({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token expirado', () => {
    scenarioTotal({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token nulo', () => {
    scenarioTotal({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    scenarioTotal({ ...validBody, token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    scenarioTotal({ ...validBody, token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- NEGATIVOS: project_id inválido, ausente, tipos errados ---
  it('Falha sem project_id', () => {
    const { project_id, ...body } = validBody;
    scenarioTotal(body).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      scenarioTotal({ ...validBody, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    scenarioTotal({ ...validBody, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Demais campos: build_id, module_id, requirement, created_by ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(val => {
    ['build_id', 'module_id'].forEach(field => {
      it(`Aceita/rejeita ${field} com valor ${JSON.stringify(val)}`, () => {
        scenarioTotal({ ...validBody, [field]: val }).then(response => {
          expect([200, 400, 422]).to.include(response.status);
        });
      });
    });
  });

  ['', null, 123, {}, [], true, false].forEach(req => {
    it(`Aceita/rejeita requirement com valor ${JSON.stringify(req)}`, () => {
      scenarioTotal({ ...validBody, requirement: req }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(val => {
    it(`Aceita/rejeita created_by[0] com valor ${JSON.stringify(val)}`, () => {
      scenarioTotal({ ...validBody, 'created_by[0]': val }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    scenarioTotal({ ...validBody, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: validBody,
        failOnStatusCode: false,
      }).then(response => {
        expect([405, 404, 400]).to.include(response.status);
      });
    });
  });

  // --- Content-Type errado ---
  it('Falha com Content-Type application/json', () => {
    cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      body: validBody,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    scenarioTotal({ ...validBody, token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    scenarioTotal(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      scenarioTotal({ ...validBody, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    scenarioTotal(validBody)
      .then(() => scenarioTotal(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});