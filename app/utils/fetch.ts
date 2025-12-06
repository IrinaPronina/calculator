// функция запросов
export async function fetchFunction(param: {
    method: string;
    body?: any;
    isForm?: boolean;
    path: string;
    query?: { [index: string]: string | number | boolean | string[] };
}) {
    const url_to_fetch_data = `${APICALC}${param.path}`;
    const url = new URL(url_to_fetch_data);
    const headers = new Headers();
    if (param.query) {
        Object.keys(param.query).forEach((key) => {
            url.searchParams.append(
                key,
                String(param.query && param.query[key])
            );
        });
    }
    if (!param.isForm) {
        headers.append('Content-Type', 'application/json');
    }
    let value_request: RequestInit = { method: param.method, headers: headers };
    if (param.body) {
        value_request['body'] = param.isForm
            ? param.body
            : JSON.stringify(param.body);
    }
    const response = await fetch(url, value_request);
    if (response.status === 200) {
        let response_data = await response.json();
        return response_data;
    } else {
        handlerErrorApi(response.status);
    }
    return;
}

export const handlerErrorApi = (status: number) => {
    if (status === 401) {
        alert('Запрос не может быть выполнен');
    } else if (status === 403) {
        alert('Запрос не может быть выполнен');
    } else if (status === 400) {
        alert('Запрос не может быть выполнен');
    } else if (status === 409) {
        alert('Запрос не может быть выполнен');
    } else if (status === 500) {
        alert('Ошибка сервера');
    } else {
        alert('Запрос не может быть выполнен');
    }
};

export const APICALC: string =
    typeof window !== 'undefined' ? window.location.origin : '';
