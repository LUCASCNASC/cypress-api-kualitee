const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/TestCaseTotal';

describe('API - Dashboard Test Case Total - /dashboard/testcase/total', () => {
  const validProjectId = Cypress.env('VALID_PROJECT_ID');
  const validModuleId = 22;

  const validBody = {
    token: validToken,
    project_id: validProjectId,
    module_id: validModuleId,
    build_id: 33,
    approved: "true",
    test_scenario_id: "44",
    created_by: "101",
    requirement: "REQ-002"
  };

  function testcaseTotal(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Retorna total de casos de teste com parâmetros completos e válidos', () => {
    testcaseTotal(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
      // Ajuste conforme contrato real
    });
  });

  it('Retorna total apenas com obrigatórios', () => {
    testcaseTotal({ token: validToken, project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    testcaseTotal({ project_id: validProjectId, module_id: validModuleId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {
    testcaseTotal({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token expirado', () => {
    testcaseTotal({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token nulo', () => {
    testcaseTotal({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    testcaseTotal({ ...validBody, token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    testcaseTotal({ ...validBody, token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- NEGATIVOS: project_id/module_id inválido, ausente, tipos errados ---
  ['project_id', 'module_id'].forEach(param => {
    it(`Falha sem ${param}`, () => {
      const body = { ...validBody };
      delete body[param];
      testcaseTotal(body).then(response => {
        expect([400, 422, 404]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });

    [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(value => {
      it(`Falha com ${param} inválido (${JSON.stringify(value)})`, () => {
        testcaseTotal({ ...validBody, [param]: value }).then(response => {
          expect([400, 422, 404]).to.include(response.status);
          expect(response.body).to.have.property('success', false);
        });
      });
    });

    it(`Falha com ${param} inexistente`, () => {
      testcaseTotal({ ...validBody, [param]: 999999 }).then(response => {
        expect([404, 422, 400]).to.include(response.status);
      });
    });
  });

  // --- Demais campos: build_id, approved, test_scenario_id, created_by, requirement ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(val => {
    ['build_id', 'test_scenario_id', 'created_by'].forEach(field => {
      it(`Aceita/rejeita ${field} com valor ${JSON.stringify(val)}`, () => {
        testcaseTotal({ ...validBody, [field]: val }).then(response => {
          expect([200, 400, 422]).to.include(response.status);
        });
      });
    });
  });

  ['', null, 123, {}, [], true, false].forEach(req => {
    it(`Aceita/rejeita requirement com valor ${JSON.stringify(req)}`, () => {
      testcaseTotal({ ...validBody, requirement: req }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  ['', null, {}, [], true, false, 'not_bool', 1, 0].forEach(approved => {
    it(`Aceita/rejeita approved com valor ${JSON.stringify(approved)}`, () => {
      testcaseTotal({ ...validBody, approved }).then(response => {
        expect([200, 400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    testcaseTotal({ ...validBody, extra: 'foo' }).then(response => {
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
    testcaseTotal({ ...validBody, token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    testcaseTotal(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      testcaseTotal({ ...validBody, project_id: validProjectId, module_id: validModuleId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    testcaseTotal(validBody)
      .then(() => testcaseTotal(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});