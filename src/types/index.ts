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

export type TResponseData = {
      data: any;
      meta: TMeta
}
export type TResponseSuccess = {
      statusCode: number;
      success: boolean;
      message: string;
      data?: TResponseData
};

export type TUser = {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt?: string;
      updatedAt?: string;
}