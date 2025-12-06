'use server';

export async function loginAction(formData: FormData) {
    const login = formData.get('login');
    const password = formData.get('password');
    console.log(login, password);
}
