import { Switch } from '@mantine/core';

const Setting = () => {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        前缀
        <Switch />
      </div>
    </div>
  );
};

export default Setting;
