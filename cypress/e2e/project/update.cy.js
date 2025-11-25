const PATH_API = '/Project/ProjectUpdate';
const validToken = Cypress.env('VALID_TOKEN');

describe('API - Project Update - /project/update', () => {

  const validBody = {
    token: validToken,
    project_name: 'Projeto Atualizado',
    project_description: 'Descrição atualizada do projeto.',
    project_type: 'desktop', // desktop, mobile, r-web, web
    project_os: ['Windows', 'Linux'],
    project_devices: ['PC', 'Laptop'],
    project_browser: ['Chrome', 'Firefox'],
    project_id: 77 // Substitua por um ID de projeto válido
  };

  function projectUpdate(body, options = {}) {
    return cy.request({
      method: 'POST',
      url: `/${PATH_API}`,
      form: true,
      body,
      failOnStatusCode: false,
      ...options,
    });
  }
  
  it('Atualiza projeto com todos os campos válidos', () => {
    projectUpdate(validBody).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- NEGATIVOS: Auth ---
  it('Falha sem token', () => {
    const { token, ...body } = validBody;
    projectUpdate(body).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token inválido', () => {
    projectUpdate({ ...validBody, token: 'token_invalido' }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  it('Falha com token expirado', () => {
    projectUpdate({ ...validBody, token: 'token_expirado' }).then(response => {
      expect([401, 403]).to.include(response.status);
    });
  });

  it('Falha com token nulo', () => {
    projectUpdate({ ...validBody, token: null }).then(response => {
      expect([400, 401, 403]).to.include(response.status);
    });
  });

  // --- Campos obrigatórios ausentes ---
  ['project_name', 'project_description', 'project_type', 'project_os', 'project_devices', 'project_browser', 'project_id'].forEach(field => {
    it(`Falha sem campo obrigatório ${field}`, () => {
      const body = { ...validBody };
      delete body[field];
      projectUpdate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- Campos obrigatórios vazios ---
  ['project_name', 'project_description', 'project_type'].forEach(field => {
    it(`Falha com campo obrigatório ${field} vazio`, () => {
      const body = { ...validBody, [field]: '' };
      projectUpdate(body).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- project_type inválido ---
  it('Falha com project_type inválido', () => {
    projectUpdate({ ...validBody, project_type: 'invalid_type' }).then(response => {
      expect([400, 422]).to.include(response.status);
    });
  });

  // --- Array fields vazios ou tipos errados ---
  ['project_os', 'project_devices', 'project_browser'].forEach(arrayField => {
    it(`Falha com campo ${arrayField} vazio`, () => {
      projectUpdate({ ...validBody, [arrayField]: [] }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
    it(`Falha com campo ${arrayField} tipo errado`, () => {
      projectUpdate({ ...validBody, [arrayField]: 'string_invalida' }).then(response => {
        expect([400, 422]).to.include(response.status);
      });
    });
  });

  // --- project_id inválido ---
  [null, '', 'abc', 0, -1, 999999999, {}, [], true, false].forEach(invalidProjectId => {
    it(`Falha com project_id inválido (${JSON.stringify(invalidProjectId)})`, () => {
      projectUpdate({ ...validBody, project_id: invalidProjectId }).then(response => {
        expect([400, 422, 404]).to.include(response.status);
      });
    });
  });

  // --- Campos extras ---
  it('Ignora campo extra no body', () => {
    projectUpdate({ ...validBody, extra: 'foo' }).then(response => {
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
    projectUpdate({ ...validBody, project_name: "' OR 1=1 --" }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });

  // --- Headers ---
  it('Headers devem conter CORS e content-type', () => {
    projectUpdate(validBody).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

  // --- Rate limit (se aplicável) ---
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      projectUpdate(validBody)
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });

  // --- Duplicidade: Aceita requisições idênticas sequenciais ---
  it('Permite requisições duplicadas rapidamente', () => {
    projectUpdate(validBody)
      .then(() => projectUpdate(validBody))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });

});