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
      totalPages: number;
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
export type TLoginResponse = IApiResponse<ILoginData>;

export type IApiResponse<T> = {
      success: boolean;
      statusCode: number;
      message: string;
      data: T;
}

export type TSignUpResponse = IApiResponse<string>;

export type TAuthor = {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      createdAt: string;
      updatedAt: string;
}

export type TComment = {
      _id: string;
      content: string;
      author: TAuthor;
      likes?: string[];
      dislikes?: string[];
      totalLike: number;
      totalDislike: number;
      parentComment: string | null;
      createdAt: string;
      updatedAt: string;
      __v: number;
}

/* export type TCommentResponse = {
      success: boolean;
      statusCode: number;
      message: string;
      data: TComment[];
} */

export type TCommentResponse = IApiResponse<{
      data: TComment[];
      meta: TMeta;
}>;