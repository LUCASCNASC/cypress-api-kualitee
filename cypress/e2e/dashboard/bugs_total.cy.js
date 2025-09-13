describe('API - Dashboard Bugs Total - /dashboard/bugs/total', () => {
  const BASE_URL = 'https://apiss.kualitee.com/api/v2';
  const validToken = 'token_valido_aqui';
  const validProjectId = 11; // Substitua por um ID válido do seu ambiente

  const validBody = {
    token: validToken,
    project_id: validProjectId,
    build_id: 22,
    module_id: 33,
    browser: "chrome",
    os: "windows",
    severity: "high",
    status: "open",
    assignto: "lucas",
    bugtype: "UI"
  };

  function bugsTotal(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `${BASE_URL}/Dashboard/DefectsTotal`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVOS ---
  it('Retorna total de bugs com todos os parâmetros válidos', () => {
    bugsTotal(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.body).to.have.property('success', true);
      expect(response.headers['content-type']).to.include('application/json');
      // Ajuste conforme contrato real
    });
  });

  it('Retorna total de bugs apenas com obrigatórios', () => {
    bugsTotal({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    bugsTotal({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token inválido', () => {
    bugsTotal({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token expirado', () => {
    bugsTotal({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  it('Falha com token nulo', () => {
    bugsTotal({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    bugsTotal({ ...validBody, token: '😀🔥💥' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    bugsTotal({ ...validBody, token: "' OR 1=1 --" }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- NEGATIVOS: project_id inválido, ausente, tipos errados ---
  it('Falha sem project_id', () => {
    const { project_id, ...body } = validBody;
    bugsTotal(body).then(response => {
      expect([400, 422, 404]).to.include(response.status);
      expect(response.body).to.have.property('success', false);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      bugsTotal({ ...validBody, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
        expect(response.body).to.have.property('success', false);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    bugsTotal({ ...validBody, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Demais campos: build_id, module_id, browser, os, severity, status, assignto, bugtype ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(val => {
    ['build_id', 'module_id'].forEach(field => {
      it(`Aceita/rejeita ${field} com valor ${JSON.stringify(val)}`, () => {
        bugsTotal({ ...validBody, [field]: val }).then(response => {
          expect([200, 400, 422]).to.include(response.status);
        });
      });
    });
    ['browser', 'os', 'severity', 'status', 'assignto', 'bugtype'].forEach(field => {
      it(`Aceita/rejeita ${field} com valor ${JSON.stringify(val)}`, () => {
        bugsTotal({ ...validBody, [field]: val }).then(response => {
          expect([200, 400, 422]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    bugsTotal({ ...validBody, extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('success', true);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `${BASE_URL}/Dashboard/DefectsTotal`,
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
      url: `${BASE_URL}/Dashboard/DefectsTotal`,
      body: validBody,
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    bugsTotal({ ...validBody, token: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    bugsTotal(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      bugsTotal({ ...validBody, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    bugsTotal(validBody)
      .then(() => bugsTotal(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});