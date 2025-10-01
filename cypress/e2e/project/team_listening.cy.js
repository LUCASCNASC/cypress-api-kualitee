const PATH_API = '/Project/ProjectTeamListing'

describe('API - Project Team Listing - /team/listing', () => {
  const validToken = Cypress.env('VALID_TOKEN');
  const validProjectId = 77; // Substitua por um id de projeto válido do seu ambiente

  function teamListing(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }

  // --- POSITIVO ---
  it('Retorna equipe do projeto com token e project_id válidos', () => {
    teamListing({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    teamListing({ project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    teamListing({ token: 'token_invalido', project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    teamListing({ token: 'token_expirado', project_id: validProjectId }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    teamListing({ token: null, project_id: validProjectId }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- project_id inválido, ausente, tipos errados, limites ---
  it('Falha sem project_id', () => {
    teamListing({ token: validToken }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(project_id => {
    it(`Falha com project_id inválido (${JSON.stringify(project_id)})`, () => {
      teamListing({ token: validToken, project_id }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  it('Falha com project_id inexistente', () => {
    teamListing({ token: validToken, project_id: 999999 }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    teamListing({ token: validToken, project_id: validProjectId, extra: 'foo' }).then(response => {
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
        body: { token: validToken, project_id: validProjectId },
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
      body: { token: validToken, project_id: validProjectId },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false
    }).then((response) => {
      expect([400, 415]).to.include(response.status);
    });
  });

  // --- Contrato: Não vazar informações sensíveis ---
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    teamListing({ token: "' OR 1=1 --", project_id: validProjectId }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    teamListing({ token: validToken, project_id: validProjectId }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      teamListing({ token: validToken, project_id: validProjectId })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    teamListing({ token: validToken, project_id: validProjectId })
      .then(() => teamListing({ token: validToken, project_id: validProjectId }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});