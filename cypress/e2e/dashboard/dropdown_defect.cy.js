const validToken = Cypress.env('VALID_TOKEN');
const PATH_API = '/Dashboard/DropdownDefects';

const validProjectId = Cypress.env('VALID_PROJECT_ID');
const validIds = Cypress.env('VALID_IDS');  

describe('API rest - Dashboard - Dashboard Dropdown Defect - /dashboard/dropdown_defect', () => {

  it('Status Code 200', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('object');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });

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
  
  it('Falha sem project_id', () => {
    dropdownDefect({ token: validToken, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([400, 422, 404]).to.include(response.status);
    });
  });

  it('Falha com project_id inexistente', () => {
    dropdownDefect({ token: validToken, project_id: 999999, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect([404, 422, 400]).to.include(response.status);
    });
  });

  it('Ignora campo extra no body', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1], extra: 'foo' }).then(response => {
      expect(response.status).to.eq(200);
    });
  });

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
  
  it('Resposta não deve vazar stacktrace, SQL, etc.', () => {
    dropdownDefect({ token: "' OR 1=1 --", project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      const body = JSON.stringify(response.body);
      expect(body).not.to.match(/exception|trace|sql|database/i);
    });
  });
  
  it('Headers devem conter CORS e content-type', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }).then(response => {
      expect(response.headers).to.have.property('access-control-allow-origin');
      expect(response.headers['content-type']).to.include('application/json');
    });
  });
  
  it('Falha após múltiplas requisições rápidas (rate limit)', () => {
    const requests = Array(10).fill(0).map(() =>
      dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
    );
    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
  
  it('Permite requisições duplicadas rapidamente', () => {
    dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] })
      .then(() => dropdownDefect({ token: validToken, project_id: validProjectId, 'id[0]': validIds[0], 'id[1]': validIds[1] }))
      .then((response) => {
        expect([200, 400, 401, 409]).to.include(response.status);
      });
  });
});