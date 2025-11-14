export type IGenericErrorMessage = {
      path: string | number;
      message: string;
};

export type IGenericErrorResponse = {
      statusCode: number;
      message: string;
      errorMessages: IGenericErrorMessage[];
};

export type TMeta = {
      limit: number;
      page: number;
      total: number;
}

export type TUser = {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt?: string;
      updatedAt?: string;
}

export interface ILoginData {
  token: string;
  userInfo: TUser;
}

export type IApiResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export type TLoginResponse = IApiResponse<ILoginData>;
export type TSignUpResponse = IApiResponse<string>;