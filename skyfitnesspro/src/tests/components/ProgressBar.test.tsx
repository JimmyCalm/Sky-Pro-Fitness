import { render } from '@testing-library/react';
import ProgressBar from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('рендерит бар с правильным процентом', () => {
    const { container } = render(
      <ProgressBar current={3} total={10} percentage={30} />
    );

    const innerBar = container.querySelector('div[style*="width: 30%"]');
    expect(innerBar).toBeInTheDocument();
  });

  it('показывает процент, если showLabel=true', () => {
    const { getByText } = render(
      <ProgressBar current={5} total={10} percentage={50} showLabel />
    );

    expect(getByText('50%')).toBeInTheDocument();
  });

  it('не показывает лейбл, если showLabel=false', () => {
    const { queryByText } = render(
      <ProgressBar current={5} total={10} percentage={50} showLabel={false} />
    );

    expect(queryByText('50%')).not.toBeInTheDocument();
  });
});
