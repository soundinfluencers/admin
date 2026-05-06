import { useLoginForm } from "@/features/auth-by-email/model/use-login-form.ts";
import { BaseMaskedPasswordInput, BaseTextInput, Button, Form } from "@/shared/ui";
import type { TLoginFormValues } from "@/features/auth-by-email/model/login-form.schema.ts";

import styles from './login-form.module.scss';

export const LoginForm = () => {
  const { methods, onSubmit, isPending } = useLoginForm();

  return (
    <Form
      methods={methods}
      onSubmit={methods.handleSubmit(onSubmit)}
      className={styles.loginForm}
    >
      <div className={styles.head}>
        <h1 className={styles.title}>Log in to your Admin Dashboard</h1>
        <p className={styles.subtitle}>Access campaign controls, user management, and performance analytics</p>
      </div>

      <div className={styles.fields}>
        <BaseTextInput<TLoginFormValues>
          name={'email'}
          label={'Email'}
          type={'email'}
          placeholder={'Enter email'}
          autoComplete={"email"}
        />

        <BaseMaskedPasswordInput<TLoginFormValues>
          name={'password'}
          label={'Password'}
          placeholder={'Enter password'}
          autoComplete={"password"}
        />
      </div>

      <div className={styles.bottom}>
        <Button
          type={"submit"}
          disabled={isPending}
          variant={'primary'}
          size={'large'}
        >
          {isPending ? "Log in..." : "Log in"}
        </Button>
      </div>
    </Form>
  );
};
