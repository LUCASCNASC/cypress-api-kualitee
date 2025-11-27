const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/DropdownDefects';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validIds = Cypress.env('VALID_IDS');  

describe('API rest - Dashboard Dropdown Defect - /dashboard/dropdown_defect', () => {

  function dropdownDefect(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Retorna lista de dropdown de defeitos com token, project_id e ids válidos', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    dropdownDefect({ project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    dropdownDefect({ token: 'token_invalido', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    dropdownDefect({ token: 'token_expirado', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    dropdownDefect({ token: null, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token contendo caracteres especiais', () => {
    dropdownDefect({ token: '😀🔥💥', project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token SQL Injection', () => {
    dropdownDefect({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    dropdownDefect({ token: validToken, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      dropdownDefect({ token: validToken, project_id, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    dropdownDefect({ token: validToken, project_id: 999999, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- id[x] inválido, ausente, tipos errados, limites ---
  ['id[0]', 'id[1]'].forEach(idKey => {
    [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(invalidValue => {
      it(`Falha com campo '${idKey}' inválido (${JSON.stringify(invalidValue)})`, () => {
        dropdownDefect({ token: validToken, project_id: validProjectId, [idKey]: invalidValue, 'id[1]': validIds[1], 'id[0]': validIds[0] }).then(response => {
          expect([400, 422, 404]).to.include(response.status);
        });
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1], extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

  // --- HTTP Method errado ---
  ['GET', 'PUT', 'DELETE', 'PATCH'].forEach(method => {
    it(`Falha com método HTTP ${method}`, () => {
      cy.request({
        method,
        url: `/${PATH_API}`,
        form: true,
        body: { token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] },
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
      body: { token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    dropdownDefect({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
      .then(() => dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});